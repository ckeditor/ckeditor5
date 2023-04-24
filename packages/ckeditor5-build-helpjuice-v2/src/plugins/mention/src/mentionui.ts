/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/mentionui
 */

import {
	Plugin,
	type Editor
} from 'ckeditor5/src/core';

import type {
	ViewDocumentKeyDownEvent,
	Marker,
	Position
} from 'ckeditor5/src/engine';

import {
	ButtonView,
	ContextualBalloon,
	clickOutsideHandler
} from 'ckeditor5/src/ui';

import {
	CKEditorError,
	Collection,
	Rect,
	env,
	keyCodes,
	logWarning,
	type PositionOptions
} from 'ckeditor5/src/utils';

import { TextWatcher, type TextWatcherMatchedEvent } from 'ckeditor5/src/typing';

import { debounce } from 'lodash-es';

import MentionsView from './ui/mentionsview';
import DomWrapperView from './ui/domwrapperview';
import MentionListItemView from './ui/mentionlistitemview';

import type {
	FeedCallback,
	MentionFeed,
	MentionFeedItem,
	ItemRenderer,
	MentionFeedObjectItem
} from './mentionconfig';

const VERTICAL_SPACING = 3;

// The key codes that mention UI handles when it is open (without commit keys).
const defaultHandledKeyCodes = [
	keyCodes.arrowup,
	keyCodes.arrowdown,
	keyCodes.esc
];

// Dropdown commit key codes.
const defaultCommitKeyCodes = [
	keyCodes.enter,
	keyCodes.tab
];

/**
 * The mention UI feature.
 */
export default class MentionUI extends Plugin {
	/**
	 * The mention view.
	 */
	private readonly _mentionsView: MentionsView;

	/**
	 * Stores mention feeds configurations.
	 */
	private _mentionsConfigurations: Map<string, Definition>;

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon: ContextualBalloon | undefined;

	private _items = new Collection<{ item: MentionFeedObjectItem; marker: string }>();

	private _lastRequested?: string;

	/**
	 * Debounced feed requester. It uses `lodash#debounce` method to delay function call.
	 */
	private _requestFeedDebounced: ( marker: string, feedText: string ) => void;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'MentionUI' {
		return 'MentionUI';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._mentionsView = this._createMentionView();
		this._mentionsConfigurations = new Map();
		this._requestFeedDebounced = debounce( this._requestFeed, 100 );

		editor.config.define( 'mention', { feeds: [] } );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		const commitKeys = editor.config.get( 'mention.commitKeys' ) || defaultCommitKeyCodes;
		const handledKeyCodes = defaultHandledKeyCodes.concat( commitKeys );

		this._balloon = editor.plugins.get( ContextualBalloon );

		// Key listener that handles navigation in mention view.
		editor.editing.view.document.on<ViewDocumentKeyDownEvent>( 'keydown', ( evt, data ) => {
			if ( isHandledKey( data.keyCode ) && this._isUIVisible ) {
				data.preventDefault();
				evt.stop(); // Required for Enter key overriding.

				if ( data.keyCode == keyCodes.arrowdown ) {
					this._mentionsView.selectNext();
				}

				if ( data.keyCode == keyCodes.arrowup ) {
					this._mentionsView.selectPrevious();
				}

				if ( commitKeys.includes( data.keyCode ) ) {
					this._mentionsView.executeSelected();
				}

				if ( data.keyCode == keyCodes.esc ) {
					this._hideUIAndRemoveMarker();
				}
			}
		}, { priority: 'highest' } ); // Required to override the Enter key.

		// Close the dropdown upon clicking outside of the plugin UI.
		clickOutsideHandler( {
			emitter: this._mentionsView,
			activator: () => this._isUIVisible,
			contextElements: () => [ this._balloon!.view.element! ],
			callback: () => this._hideUIAndRemoveMarker()
		} );

		const feeds = editor.config.get( 'mention.feeds' )!;

		for ( const mentionDescription of feeds ) {
			const { feed, marker, dropdownLimit } = mentionDescription;

			if ( !isValidMentionMarker( marker ) ) {
				/**
				 * The marker must be a single character.
				 *
				 * Correct markers: `'@'`, `'#'`.
				 *
				 * Incorrect markers: `'$$'`, `'[@'`.
				 *
				 * See {@link module:mention/mentionconfig~MentionConfig}.
				 *
				 * @error mentionconfig-incorrect-marker
				 * @param marker Configured marker
				 */
				throw new CKEditorError( 'mentionconfig-incorrect-marker', null, { marker } );
			}

			const feedCallback = typeof feed == 'function' ? feed.bind( this.editor ) : createFeedCallback( feed );
			const itemRenderer = mentionDescription.itemRenderer;
			const definition = { marker, feedCallback, itemRenderer, dropdownLimit };

			this._mentionsConfigurations.set( marker, definition );
		}

		this._setupTextWatcher( feeds );
		this.listenTo( editor, 'change:isReadOnly', () => {
			this._hideUIAndRemoveMarker();
		} );
		this.on<RequestFeedResponseEvent>( 'requestFeed:response', ( evt, data ) => this._handleFeedResponse( data ) );
		this.on<RequestFeedErrorEvent>( 'requestFeed:error', () => this._hideUIAndRemoveMarker() );

		/**
		 * Checks if a given key code is handled by the mention UI.
		 */
		function isHandledKey( keyCode: number ): boolean {
			return handledKeyCodes.includes( keyCode );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		this._mentionsView.destroy();
	}

	/**
	 * Returns true when {@link #_mentionsView} is in the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} and it is
	 * currently visible.
	 */
	private get _isUIVisible(): boolean {
		return this._balloon!.visibleView === this._mentionsView;
	}

	/**
	 * Creates the {@link #_mentionsView}.
	 */
	private _createMentionView(): MentionsView {
		const locale = this.editor.locale;

		const mentionsView = new MentionsView( locale );

		mentionsView.items.bindTo( this._items ).using( data => {
			const { item, marker } = data;

			const { dropdownLimit: markerDropdownLimit } = this._mentionsConfigurations.get( marker )!;

			// Set to 10 by default for backwards compatibility. See: #10479
			const dropdownLimit = markerDropdownLimit || this.editor.config.get( 'mention.dropdownLimit' ) || 10;

			if ( mentionsView.items.length >= dropdownLimit ) {
				return null;
			}

			const listItemView = new MentionListItemView( locale );

			const view = this._renderItem( item, marker );
			view.delegate( 'execute' ).to( listItemView );

			listItemView.children.add( view );
			listItemView.item = item;
			listItemView.marker = marker;

			listItemView.on( 'execute', () => {
				mentionsView.fire( 'execute', {
					item,
					marker
				} );
			} );

			return listItemView;
		} );

		mentionsView.on( 'execute', ( evt, data ) => {
			const editor = this.editor;
			const model = editor.model;

			const item = data.item;
			const marker = data.marker;

			const mentionMarker = editor.model.markers.get( 'mention' );

			// Create a range on matched text.
			const end = model.createPositionAt( model.document.selection.focus! );
			const start = model.createPositionAt( mentionMarker!.getStart() );
			const range = model.createRange( start, end );

			this._hideUIAndRemoveMarker();

			editor.execute( 'mention', {
				mention: item,
				text: item.text,
				marker,
				range
			} );

			editor.editing.view.focus();
		} );

		return mentionsView;
	}

	/**
	 * Returns item renderer for the marker.
	 */
	private _getItemRenderer( marker: string ): ItemRenderer | undefined {
		const { itemRenderer } = this._mentionsConfigurations.get( marker )!;

		return itemRenderer;
	}

	/**
	 * Requests a feed from a configured callbacks.
	 */
	private _requestFeed( marker: string, feedText: string ): void {
		// @if CK_DEBUG_MENTION // console.log( '%c[Feed]%c Requesting for', 'color: blue', 'color: black', `"${ feedText }"` );

		// Store the last requested feed - it is used to discard any out-of order requests.
		this._lastRequested = feedText;

		const { feedCallback } = this._mentionsConfigurations.get( marker )!;
		const feedResponse = feedCallback( feedText );

		const isAsynchronous = feedResponse instanceof Promise;

		// For synchronous feeds (e.g. callbacks, arrays) fire the response event immediately.
		if ( !isAsynchronous ) {
			this.fire<RequestFeedResponseEvent>( 'requestFeed:response', { feed: feedResponse, marker, feedText } );

			return;
		}

		// Handle the asynchronous responses.
		feedResponse
			.then( response => {
				// Check the feed text of this response with the last requested one so either:
				if ( this._lastRequested == feedText ) {
					// It is the same and fire the response event.
					this.fire<RequestFeedResponseEvent>( 'requestFeed:response', { feed: response, marker, feedText } );
				} else {
					// It is different - most probably out-of-order one, so fire the discarded event.
					this.fire<RequestFeedDiscardedEvent>( 'requestFeed:discarded', { feed: response, marker, feedText } );
				}
			} )
			.catch( error => {
				this.fire<RequestFeedErrorEvent>( 'requestFeed:error', { error } );

				/**
				 * The callback used for obtaining mention autocomplete feed thrown and error and the mention UI was hidden or
				 * not displayed at all.
				 *
				 * @error mention-feed-callback-error
				 */
				logWarning( 'mention-feed-callback-error', { marker } );
			} );
	}

	/**
	 * Registers a text watcher for the marker.
	 */
	private _setupTextWatcher( feeds: Array<MentionFeed> ): TextWatcher {
		const editor = this.editor;

		const feedsWithPattern: Array<MentionFeed & { pattern: RegExp }> = feeds.map( feed => ( {
			...feed,
			pattern: createRegExp( feed.marker, feed.minimumCharacters || 0 )
		} ) );

		const watcher = new TextWatcher( editor.model, createTestCallback( feedsWithPattern ) );

		watcher.on<TextWatcherMatchedEvent>( 'matched', ( evt, data ) => {
			const markerDefinition = getLastValidMarkerInText( feedsWithPattern, data.text );
			const selection = editor.model.document.selection;
			const focus = selection.focus;
			const markerPosition = editor.model.createPositionAt( focus!.parent, markerDefinition!.position );

			if ( isPositionInExistingMention( focus! ) || isMarkerInExistingMention( markerPosition ) ) {
				this._hideUIAndRemoveMarker();

				return;
			}

			const feedText = requestFeedText( markerDefinition, data.text );
			const matchedTextLength = markerDefinition!.marker.length + feedText.length;

			// Create a marker range.
			const start = focus!.getShiftedBy( -matchedTextLength );
			const end = focus!.getShiftedBy( -feedText.length );

			const markerRange = editor.model.createRange( start, end );

			// @if CK_DEBUG_MENTION // console.group( '%c[TextWatcher]%c matched', 'color: red', 'color: black', `"${ feedText }"` );
			// @if CK_DEBUG_MENTION // console.log( 'data#text', `"${ data.text }"` );
			// @if CK_DEBUG_MENTION // console.log( 'data#range', data.range.start.path, data.range.end.path );
			// @if CK_DEBUG_MENTION // console.log( 'marker definition', markerDefinition );
			// @if CK_DEBUG_MENTION // console.log( 'marker range', markerRange.start.path, markerRange.end.path );

			if ( checkIfStillInCompletionMode( editor ) ) {
				const mentionMarker = editor.model.markers.get( 'mention' )!;

				// Update the marker - user might've moved the selection to other mention trigger.
				editor.model.change( writer => {
					// @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Updating the marker.', 'color: purple', 'color: black' );

					writer.updateMarker( mentionMarker, { range: markerRange } );
				} );
			} else {
				editor.model.change( writer => {
					// @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Adding the marker.', 'color: purple', 'color: black' );

					writer.addMarker( 'mention', { range: markerRange, usingOperation: false, affectsData: false } );
				} );
			}

			this._requestFeedDebounced( markerDefinition!.marker, feedText );

			// @if CK_DEBUG_MENTION // console.groupEnd();
		} );

		watcher.on( 'unmatched', () => {
			this._hideUIAndRemoveMarker();
		} );

		const mentionCommand = editor.commands.get( 'mention' )!;
		watcher.bind( 'isEnabled' ).to( mentionCommand );

		return watcher;
	}

	/**
	 * Handles the feed response event data.
	 */
	private _handleFeedResponse( data: RequestFeedResponseEvent['args'][0] ) {
		const { feed, marker } = data;

		// eslint-disable-next-line max-len
		// @if CK_DEBUG_MENTION // console.log( `%c[Feed]%c Response for "${ data.feedText }" (${ feed.length })`, 'color: blue', 'color: black', feed );

		// If the marker is not in the document happens when the selection had changed and the 'mention' marker was removed.
		if ( !checkIfStillInCompletionMode( this.editor ) ) {
			return;
		}

		// Reset the view.
		this._items.clear();

		for ( const feedItem of feed ) {
			const item = typeof feedItem != 'object' ? { id: feedItem, text: feedItem } : feedItem;

			this._items.add( { item, marker } );
		}

		const mentionMarker = this.editor.model.markers.get( 'mention' );

		if ( this._items.length ) {
			this._showOrUpdateUI( mentionMarker! );
		} else {
			// Do not show empty mention UI.
			this._hideUIAndRemoveMarker();
		}
	}

	/**
	 * Shows the mentions balloon. If the panel is already visible, it will reposition it.
	 */
	private _showOrUpdateUI( markerMarker: Marker ): void {
		if ( this._isUIVisible ) {
			// @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Updating position.', 'color: green', 'color: black' );

			// Update balloon position as the mention list view may change its size.
			this._balloon!.updatePosition( this._getBalloonPanelPositionData( markerMarker, this._mentionsView!.position ) );
		} else {
			// @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Showing the UI.', 'color: green', 'color: black' );

			this._balloon!.add( {
				view: this._mentionsView,
				position: this._getBalloonPanelPositionData( markerMarker, this._mentionsView.position ),
				singleViewMode: true
			} );
		}

		this._mentionsView.position = this._balloon!.view.position;
		this._mentionsView.selectFirst();
	}

	/**
	 * Hides the mentions balloon and removes the 'mention' marker from the markers collection.
	 */
	private _hideUIAndRemoveMarker(): void {
		// Remove the mention view from balloon before removing marker - it is used by balloon position target().
		if ( this._balloon!.hasView( this._mentionsView ) ) {
			// @if CK_DEBUG_MENTION // console.log( '%c[UI]%c Hiding the UI.', 'color: green', 'color: black' );

			this._balloon!.remove( this._mentionsView );
		}

		if ( checkIfStillInCompletionMode( this.editor ) ) {
			// @if CK_DEBUG_MENTION // console.log( '%c[Editing]%c Removing marker.', 'color: purple', 'color: black' );

			this.editor.model.change( writer => writer.removeMarker( 'mention' ) );
		}

		// Make the last matched position on panel view undefined so the #_getBalloonPanelPositionData() method will return all positions
		// on the next call.
		this._mentionsView.position = undefined;
	}

	/**
	 * Renders a single item in the autocomplete list.
	 */
	private _renderItem( item: MentionFeedObjectItem, marker: string ): DomWrapperView | ButtonView {
		const editor = this.editor;

		let view;
		let label = item.id;

		const renderer = this._getItemRenderer( marker );

		if ( renderer ) {
			const renderResult = renderer( item );

			if ( typeof renderResult != 'string' ) {
				view = new DomWrapperView( editor.locale, renderResult );
			} else {
				label = renderResult;
			}
		}

		if ( !view ) {
			const buttonView = new ButtonView( editor.locale );

			buttonView.label = label;
			buttonView.withText = true;

			view = buttonView;
		}

		return view;
	}

	/**
	 * Creates a position options object used to position the balloon panel.
	 *
	 * @param mentionMarker
	 * @param preferredPosition The name of the last matched position name.
	 */
	private _getBalloonPanelPositionData( mentionMarker: Marker, preferredPosition: MentionsView['position'] ): Partial<PositionOptions> {
		const editor = this.editor;
		const editing = editor.editing;
		const domConverter = editing.view.domConverter;
		const mapper = editing.mapper;
		const uiLanguageDirection = editor.locale.uiLanguageDirection;

		return {
			target: () => {
				let modelRange = mentionMarker.getRange();

				// Target the UI to the model selection range - the marker has been removed so probably the UI will not be shown anyway.
				// The logic is used by ContextualBalloon to display another panel in the same place.
				if ( modelRange.start.root.rootName == '$graveyard' ) {
					modelRange = editor.model.document.selection.getFirstRange()!;
				}

				const viewRange = mapper.toViewRange( modelRange );
				const rangeRects = Rect.getDomRangeRects( domConverter.viewRangeToDom( viewRange ) );

				return rangeRects.pop()!;
			},
			limiter: () => {
				const view = this.editor.editing.view;
				const viewDocument = view.document;
				const editableElement = viewDocument.selection.editableElement;

				if ( editableElement ) {
					return view.domConverter.mapViewToDom( editableElement.root ) as HTMLElement;
				}

				return null;
			},
			positions: getBalloonPanelPositions( preferredPosition, uiLanguageDirection )
		};
	}
}

/**
 * Returns the balloon positions data callbacks.
 */
function getBalloonPanelPositions(
	preferredPosition: MentionsView['position'],
	uiLanguageDirection: string
): PositionOptions['positions'] {
	const positions: Record<string, PositionOptions['positions'][0]> = {
		// Positions the panel to the southeast of the caret rectangle.
		'caret_se': ( targetRect: Rect ) => {
			return {
				top: targetRect.bottom + VERTICAL_SPACING,
				left: targetRect.right,
				name: 'caret_se',
				config: {
					withArrow: false
				}
			};
		},

		// Positions the panel to the northeast of the caret rectangle.
		'caret_ne': ( targetRect: Rect, balloonRect: Rect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right,
				name: 'caret_ne',
				config: {
					withArrow: false
				}
			};
		},

		// Positions the panel to the southwest of the caret rectangle.
		'caret_sw': ( targetRect: Rect, balloonRect: Rect ) => {
			return {
				top: targetRect.bottom + VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_sw',
				config: {
					withArrow: false
				}
			};
		},

		// Positions the panel to the northwest of the caret rect.
		'caret_nw': ( targetRect: Rect, balloonRect: Rect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_nw',
				config: {
					withArrow: false
				}
			};
		}
	};

	// Returns only the last position if it was matched to prevent the panel from jumping after the first match.
	if ( Object.prototype.hasOwnProperty.call( positions, preferredPosition! ) ) {
		return [
			positions[ preferredPosition! ]
		];
	}

	// By default, return all position callbacks ordered depending on the UI language direction.
	return uiLanguageDirection !== 'rtl' ? [
		positions.caret_se,
		positions.caret_sw,
		positions.caret_ne,
		positions.caret_nw
	] : [
		positions.caret_sw,
		positions.caret_se,
		positions.caret_nw,
		positions.caret_ne
	];
}

/**
 * Returns a marker definition of the last valid occurring marker in a given string.
 * If there is no valid marker in a string, it returns undefined.
 *
 * Example of returned object:
 *
 * ```ts
 * {
 * 	marker: '@',
 * 	position: 4,
 * 	minimumCharacters: 0
 * }
 * ````
 *
 * @param feedsWithPattern Registered feeds in editor for mention plugin with created RegExp for matching marker.
 * @param text String to find the marker in
 * @returns Matched marker's definition
 */
function getLastValidMarkerInText(
	feedsWithPattern: Array<MentionFeed & { pattern: RegExp }>,
	text: string
): MarkerDefinition {
	let lastValidMarker: any;

	for ( const feed of feedsWithPattern ) {
		const currentMarkerLastIndex = text.lastIndexOf( feed.marker );

		if ( currentMarkerLastIndex > 0 && !text.substring( currentMarkerLastIndex - 1 ).match( feed.pattern ) ) {
			continue;
		}

		if ( !lastValidMarker || currentMarkerLastIndex >= lastValidMarker.position ) {
			lastValidMarker = {
				marker: feed.marker,
				position: currentMarkerLastIndex,
				minimumCharacters: feed.minimumCharacters,
				pattern: feed.pattern
			};
		}
	}

	return lastValidMarker;
}

/**
 * Creates a RegExp pattern for the marker.
 *
 * Function has to be exported to achieve 100% code coverage.
 */
export function createRegExp( marker: string, minimumCharacters: number ): RegExp {
	const numberOfCharacters = minimumCharacters == 0 ? '*' : `{${ minimumCharacters },}`;

	const openAfterCharacters = env.features.isRegExpUnicodePropertySupported ? '\\p{Ps}\\p{Pi}"\'' : '\\(\\[{"\'';
	const mentionCharacters = '.';

	// The pattern consists of 3 groups:
	// - 0 (non-capturing): Opening sequence - start of the line, space or an opening punctuation character like "(" or "\"",
	// - 1: The marker character,
	// - 2: Mention input (taking the minimal length into consideration to trigger the UI),
	//
	// The pattern matches up to the caret (end of string switch - $).
	//               (0:      opening sequence       )(1:   marker  )(2:                typed mention              )$
	const pattern = `(?:^|[ ${ openAfterCharacters }])([${ marker }])(${ mentionCharacters }${ numberOfCharacters })$`;
	return new RegExp( pattern, 'u' );
}

/**
 * Creates a test callback for the marker to be used in the text watcher instance.
 *
 * @param feedsWithPattern Feeds of mention plugin configured in editor with RegExp to match marker in text
 */
function createTestCallback( feedsWithPattern: Array<MentionFeed & { pattern: RegExp }> ): ( text: string ) => boolean {
	const textMatcher = ( text: string ) => {
		const markerDefinition = getLastValidMarkerInText( feedsWithPattern, text );

		if ( !markerDefinition ) {
			return false;
		}

		let splitStringFrom = 0;

		if ( markerDefinition.position !== 0 ) {
			splitStringFrom = markerDefinition.position - 1;
		}

		const textToTest = text.substring( splitStringFrom );

		return markerDefinition.pattern.test( textToTest );
	};

	return textMatcher;
}

/**
 * Creates a text matcher from the marker.
 */
function requestFeedText( markerDefinition: MarkerDefinition, text: string ): string {
	let splitStringFrom = 0;

	if ( markerDefinition.position !== 0 ) {
		splitStringFrom = markerDefinition.position - 1;
	}

	const regExp = createRegExp( markerDefinition.marker, 0 );
	const textToMatch = text.substring( splitStringFrom );
	const match = textToMatch.match( regExp )!;

	return match[ 2 ];
}

/**
 * The default feed callback.
 */
function createFeedCallback( feedItems: Array<MentionFeedItem> ) {
	return ( feedText: string ) => {
		const filteredItems = feedItems
			// Make the default mention feed case-insensitive.
			.filter( item => {
				// Item might be defined as object.
				const itemId = typeof item == 'string' ? item : String( item.id );

				// The default feed is case insensitive.
				return itemId.toLowerCase().includes( feedText.toLowerCase() );
			} );
		return filteredItems;
	};
}

/**
 * Checks if position in inside or right after a text with a mention.
 */
function isPositionInExistingMention( position: Position ): boolean | null {
	// The text watcher listens only to changed range in selection - so the selection attributes are not yet available
	// and you cannot use selection.hasAttribute( 'mention' ) just yet.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/1723.
	const hasMention = position.textNode && position.textNode.hasAttribute( 'mention' );

	const nodeBefore = position.nodeBefore;

	return hasMention || nodeBefore && nodeBefore.is( '$text' ) && nodeBefore.hasAttribute( 'mention' );
}

/**
 * Checks if the closest marker offset is at the beginning of a mention.
 *
 * See https://github.com/ckeditor/ckeditor5/issues/11400.
 */
function isMarkerInExistingMention( markerPosition: Position ): boolean | null {
	const nodeAfter = markerPosition.nodeAfter;

	return nodeAfter && nodeAfter.is( '$text' ) && nodeAfter.hasAttribute( 'mention' );
}

/**
 * Checks if string is a valid mention marker.
 */
function isValidMentionMarker( marker: string ): boolean | string {
	return marker && marker.length == 1;
}

/**
 * Checks the mention plugins is in completion mode (e.g. when typing is after a valid mention string like @foo).
 */
function checkIfStillInCompletionMode( editor: Editor ): boolean {
	return editor.model.markers.has( 'mention' );
}

type RequestFeedResponse = {

	/**
	 * Autocomplete items
	 */
	feed: Array<MentionFeedItem>;

	/**
	 * The character which triggers autocompletion for mention.
	 */
	marker: string;

	/**
	 * The text for which feed items were requested.
	 */
	feedText: string;
};

type RequestFeedError = {

	/**
	 * The error that was caught.
	 */
	error: ErrorEvent;
};

/**
 * Fired whenever requested feed has a response.
 */
type RequestFeedResponseEvent = {
	name: 'requestFeed:response';
	args: [ RequestFeedResponse ];
};

/**
 * Fired whenever the requested feed was discarded. This happens when the response was delayed and
 * other feed was already requested.
 */
type RequestFeedDiscardedEvent = {
	name: 'requestFeed:discarded';
	args: [ RequestFeedResponse ];
};

/**
 * Fired whenever the requested {@link module:mention/mentionconfig~MentionFeed#feed} promise fails with error.
 */
type RequestFeedErrorEvent = {
	name: 'requestFeed:error';
	args: [ RequestFeedError ];
};

type Definition = {
	marker: string;
	feedCallback: FeedCallback;
	itemRenderer?: ItemRenderer;
	dropdownLimit?: number;
};

type MarkerDefinition = {
	marker: string;
	minimumCharacters?: number;
	pattern: RegExp;
	position: number;
};
