/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/mentionui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, ContextualBalloon, clickOutsideHandler } from 'ckeditor5/src/ui';
import { Collection, keyCodes, env, Rect, CKEditorError, logWarning } from 'ckeditor5/src/utils';
import { TextWatcher } from 'ckeditor5/src/typing';

import { debounce } from 'lodash-es';

import MentionsView from './ui/mentionsview';
import DomWrapperView from './ui/domwrapperview';
import MentionListItemView from './ui/mentionlistitemview';

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
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MentionUI';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The mention view.
		 *
		 * @type {module:mention/ui/mentionsview~MentionsView}
		 * @private
		 */
		this._mentionsView = this._createMentionView();

		/**
		 * Stores mention feeds configurations.
		 *
		 * @type {Map<String, Object>}
		 * @private
		 */
		this._mentionsConfigurations = new Map();

		/**
		 * Debounced feed requester. It uses `lodash#debounce` method to delay function call.
		 *
		 * @private
		 * @param {String} marker
		 * @param {String} feedText
		 * @method
		 */
		this._requestFeedDebounced = debounce( this._requestFeed, 100 );

		editor.config.define( 'mention', { feeds: [] } );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		const commitKeys = editor.config.get( 'mention.commitKeys' ) || defaultCommitKeyCodes;
		const handledKeyCodes = defaultHandledKeyCodes.concat( commitKeys );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		// Key listener that handles navigation in mention view.
		editor.editing.view.document.on( 'keydown', ( evt, data ) => {
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
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUIAndRemoveMarker()
		} );

		const feeds = editor.config.get( 'mention.feeds' );

		for ( const mentionDescription of feeds ) {
			const feed = mentionDescription.feed;

			const marker = mentionDescription.marker;

			if ( !isValidMentionMarker( marker ) ) {
				/**
				 * The marker must be a single character.
				 *
				 * Correct markers: `'@'`, `'#'`.
				 *
				 * Incorrect markers: `'$$'`, `'[@'`.
				 *
				 * See {@link module:mention/mention~MentionConfig}.
				 *
				 * @error mentionconfig-incorrect-marker
				 * @param {String} marker Configured marker
				 */
				throw new CKEditorError( 'mentionconfig-incorrect-marker', null, { marker } );
			}

			const feedCallback = typeof feed == 'function' ? feed.bind( this.editor ) : createFeedCallback( feed );
			const itemRenderer = mentionDescription.itemRenderer;
			const definition = { marker, feedCallback, itemRenderer };

			this._mentionsConfigurations.set( marker, definition );
		}

		this._setupTextWatcher( feeds );
		this.listenTo( editor, 'change:isReadOnly', () => {
			this._hideUIAndRemoveMarker();
		} );
		this.on( 'requestFeed:response', ( evt, data ) => this._handleFeedResponse( data ) );
		this.on( 'requestFeed:error', () => this._hideUIAndRemoveMarker() );

		// Checks if a given key code is handled by the mention UI.
		//
		// @param {Number}
		// @returns {Boolean}
		function isHandledKey( keyCode ) {
			return handledKeyCodes.includes( keyCode );
		}
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		this._mentionsView.destroy();
	}

	/**
	 * Returns true when {@link #_mentionsView} is in the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} and it is
	 * currently visible.
	 *
	 * @readonly
	 * @protected
	 * @type {Boolean}
	 */
	get _isUIVisible() {
		return this._balloon.visibleView === this._mentionsView;
	}

	/**
	 * Creates the {@link #_mentionsView}.
	 *
	 * @private
	 * @returns {module:mention/ui/mentionsview~MentionsView}
	 */
	_createMentionView() {
		const locale = this.editor.locale;

		const mentionsView = new MentionsView( locale );

		this._items = new Collection();

		mentionsView.items.bindTo( this._items ).using( data => {
			const { item, marker } = data;

			// Set to 10 by default for backwards compatibility. See: #10479
			const dropdownLimit = this.editor.config.get( 'mention.dropdownLimit' ) || 10;

			if ( mentionsView.items.length >= dropdownLimit ) {
				return;
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
			const end = model.createPositionAt( model.document.selection.focus );
			const start = model.createPositionAt( mentionMarker.getStart() );
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
	 *
	 * @private
	 * @param {String} marker
	 * @returns {Function|null}
	 */
	_getItemRenderer( marker ) {
		const { itemRenderer } = this._mentionsConfigurations.get( marker );

		return itemRenderer;
	}

	/**
	 * Requests a feed from a configured callbacks.
	 *
	 * @private
	 * @fires module:mention/mentionui~MentionUI#event:requestFeed:response
	 * @fires module:mention/mentionui~MentionUI#event:requestFeed:discarded
	 * @fires module:mention/mentionui~MentionUI#event:requestFeed:error
	 * @param {String} marker
	 * @param {String} feedText
	 */
	_requestFeed( marker, feedText ) {
		// Store the last requested feed - it is used to discard any out-of order requests.
		this._lastRequested = feedText;

		const { feedCallback } = this._mentionsConfigurations.get( marker );
		const feedResponse = feedCallback( feedText );

		const isAsynchronous = feedResponse instanceof Promise;

		// For synchronous feeds (e.g. callbacks, arrays) fire the response event immediately.
		if ( !isAsynchronous ) {
			/**
			 * Fired whenever requested feed has a response.
			 *
			 * @event requestFeed:response
			 * @param {Object} data Event data.
			 * @param {Array.<module:mention/mention~MentionFeedItem>} data.feed Autocomplete items.
			 * @param {String} data.marker The character which triggers autocompletion for mention.
			 * @param {String} data.feedText The text for which feed items were requested.
			 */
			this.fire( 'requestFeed:response', { feed: feedResponse, marker, feedText } );

			return;
		}

		// Handle the asynchronous responses.
		feedResponse
			.then( response => {
				// Check the feed text of this response with the last requested one so either:
				if ( this._lastRequested == feedText ) {
					// It is the same and fire the response event.
					this.fire( 'requestFeed:response', { feed: response, marker, feedText } );
				} else {
					// It is different - most probably out-of-order one, so fire the discarded event.
					/**
					 * Fired whenever the requested feed was discarded. This happens when the response was delayed and
					 * other feed was already requested.
					 *
					 * @event requestFeed:discarded
					 * @param {Object} data Event data.
					 * @param {Array.<module:mention/mention~MentionFeedItem>} data.feed Autocomplete items.
					 * @param {String} data.marker The character which triggers autocompletion for mention.
					 * @param {String} data.feedText The text for which feed items were requested.
					 */
					this.fire( 'requestFeed:discarded', { feed: response, marker, feedText } );
				}
			} )
			.catch( error => {
				/**
				 * Fired whenever the requested {@link module:mention/mention~MentionFeed#feed} promise fails with error.
				 *
				 * @event requestFeed:error
				 * @param {Object} data Event data.
				 * @param {Error} data.error The error that was caught.
				 */
				this.fire( 'requestFeed:error', { error } );

				/**
				 * The callback used for obtaining mention autocomplete feed thrown and error and the mention UI was hidden or
				 * not displayed at all.
				 *
				 * @error mention-feed-callback-error
				 * @param {String} marker Configured marker for which error occurred.
				 */
				logWarning( 'mention-feed-callback-error', { marker } );
			} );
	}

	/**
	 * Registers a text watcher for the marker.
	 *
	 * @private
	 * @param {Array.<Object>} feeds Feeds of mention plugin configured in editor
	 * @returns {module:typing/textwatcher~TextWatcher}
	 */
	_setupTextWatcher( feeds ) {
		const editor = this.editor;

		const feedsWithPattern = feeds.map( feed => ( {
			...feed,
			pattern: createRegExp( feed.marker, feed.minimumCharacters || 0 )
		} ) );

		const watcher = new TextWatcher( editor.model, createTestCallback( feedsWithPattern ) );

		watcher.on( 'matched', ( evt, data ) => {
			const markerDefinition = getLastValidMarkerInText( feedsWithPattern, data.text );
			const selection = editor.model.document.selection;
			const focus = selection.focus;

			if ( hasExistingMention( focus ) ) {
				this._hideUIAndRemoveMarker();

				return;
			}

			const feedText = requestFeedText( markerDefinition, data.text );
			const matchedTextLength = markerDefinition.marker.length + feedText.length;

			// Create a marker range.
			const start = focus.getShiftedBy( -matchedTextLength );
			const end = focus.getShiftedBy( -feedText.length );

			const markerRange = editor.model.createRange( start, end );

			if ( checkIfStillInCompletionMode( editor ) ) {
				const mentionMarker = editor.model.markers.get( 'mention' );

				// Update the marker - user might've moved the selection to other mention trigger.
				editor.model.change( writer => {
					writer.updateMarker( mentionMarker, { range: markerRange } );
				} );
			} else {
				editor.model.change( writer => {
					writer.addMarker( 'mention', { range: markerRange, usingOperation: false, affectsData: false } );
				} );
			}

			this._requestFeedDebounced( markerDefinition.marker, feedText );
		} );

		watcher.on( 'unmatched', () => {
			this._hideUIAndRemoveMarker();
		} );

		const mentionCommand = editor.commands.get( 'mention' );
		watcher.bind( 'isEnabled' ).to( mentionCommand );

		return watcher;
	}

	/**
	 * Handles the feed response event data.
	 *
	 * @param data
	 * @private
	 */
	_handleFeedResponse( data ) {
		const { feed, marker } = data;

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
			this._showOrUpdateUI( mentionMarker );
		} else {
			// Do not show empty mention UI.
			this._hideUIAndRemoveMarker();
		}
	}

	/**
	 * Shows the mentions balloon. If the panel is already visible, it will reposition it.
	 *
	 * @private
	 */
	_showOrUpdateUI( markerMarker ) {
		if ( this._isUIVisible ) {
			// Update balloon position as the mention list view may change its size.
			this._balloon.updatePosition( this._getBalloonPanelPositionData( markerMarker, this._mentionsView.position ) );
		} else {
			this._balloon.add( {
				view: this._mentionsView,
				position: this._getBalloonPanelPositionData( markerMarker, this._mentionsView.position ),
				singleViewMode: true
			} );
		}

		this._mentionsView.position = this._balloon.view.position;
		this._mentionsView.selectFirst();
	}

	/**
	 * Hides the mentions balloon and removes the 'mention' marker from the markers collection.
	 *
	 * @private
	 */
	_hideUIAndRemoveMarker() {
		// Remove the mention view from balloon before removing marker - it is used by balloon position target().
		if ( this._balloon.hasView( this._mentionsView ) ) {
			this._balloon.remove( this._mentionsView );
		}

		if ( checkIfStillInCompletionMode( this.editor ) ) {
			this.editor.model.change( writer => writer.removeMarker( 'mention' ) );
		}

		// Make the last matched position on panel view undefined so the #_getBalloonPanelPositionData() method will return all positions
		// on the next call.
		this._mentionsView.position = undefined;
	}

	/**
	 * Renders a single item in the autocomplete list.
	 *
	 * @private
	 * @param {module:mention/mention~MentionFeedItem} item
	 * @param {String} marker
	 * @returns {module:ui/button/buttonview~ButtonView|module:mention/ui/domwrapperview~DomWrapperView}
	 */
	_renderItem( item, marker ) {
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
	 * @param {module:engine/model/markercollection~Marker} mentionMarker
	 * @param {String|undefined} preferredPosition The name of the last matched position name.
	 * @returns {module:utils/dom/position~Options}
	 * @private
	 */
	_getBalloonPanelPositionData( mentionMarker, preferredPosition ) {
		const editor = this.editor;
		const editing = editor.editing;
		const domConverter = editing.view.domConverter;
		const mapper = editing.mapper;

		return {
			target: () => {
				let modelRange = mentionMarker.getRange();

				// Target the UI to the model selection range - the marker has been removed so probably the UI will not be shown anyway.
				// The logic is used by ContextualBalloon to display another panel in the same place.
				if ( modelRange.start.root.rootName == '$graveyard' ) {
					modelRange = editor.model.document.selection.getFirstRange();
				}

				const viewRange = mapper.toViewRange( modelRange );
				const rangeRects = Rect.getDomRangeRects( domConverter.viewRangeToDom( viewRange ) );

				return rangeRects.pop();
			},
			limiter: () => {
				const view = this.editor.editing.view;
				const viewDocument = view.document;
				const editableElement = viewDocument.selection.editableElement;

				if ( editableElement ) {
					return view.domConverter.mapViewToDom( editableElement.root );
				}

				return null;
			},
			positions: getBalloonPanelPositions( preferredPosition )
		};
	}
}

// Returns the balloon positions data callbacks.
//
// @param {String} preferredPosition
// @returns {Array.<module:utils/dom/position~Position>}
function getBalloonPanelPositions( preferredPosition ) {
	const positions = {
		// Positions the panel to the southeast of the caret rectangle.
		'caret_se': targetRect => {
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
		'caret_ne': ( targetRect, balloonRect ) => {
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
		'caret_sw': ( targetRect, balloonRect ) => {
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
		'caret_nw': ( targetRect, balloonRect ) => {
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
	if ( Object.prototype.hasOwnProperty.call( positions, preferredPosition ) ) {
		return [
			positions[ preferredPosition ]
		];
	}

	// By default return all position callbacks.
	return [
		positions.caret_se,
		positions.caret_sw,
		positions.caret_ne,
		positions.caret_nw
	];
}

// Returns a marker definition of the last valid occurring marker in a given string.
// If there is no valid marker in a string, it returns undefined.
//
// Example of returned object:
//
//		{
//			marker: '@',
//			position: 4,
//			minimumCharacters: 0
//		}
//
// @param {Array.<Object>} feedsWithPattern Registered feeds in editor for mention plugin with created RegExp for matching marker.
// @param {String} text String to find the marker in
// @returns {Object} Matched marker's definition
function getLastValidMarkerInText( feedsWithPattern, text ) {
	let lastValidMarker;

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

// Creates a RegExp pattern for the marker.
//
// Function has to be exported to achieve 100% code coverage.
//
// @param {String} marker
// @param {Number} minimumCharacters
// @returns {RegExp}
export function createRegExp( marker, minimumCharacters ) {
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

// Creates a test callback for the marker to be used in the text watcher instance.
//
// @param {Array.<Object>} feedsWithPattern Feeds of mention plugin configured in editor with RegExp to match marker in text
// @returns {Function}
function createTestCallback( feedsWithPattern ) {
	const textMatcher = text => {
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

// Creates a text matcher from the marker.
//
// @param {Object} markerDefinition
// @param {String} text
// @returns {Function}
function requestFeedText( markerDefinition, text ) {
	let splitStringFrom = 0;

	if ( markerDefinition.position !== 0 ) {
		splitStringFrom = markerDefinition.position - 1;
	}

	const regExp = createRegExp( markerDefinition.marker, 0 );
	const textToMatch = text.substring( splitStringFrom );
	const match = textToMatch.match( regExp );

	return match[ 2 ];
}

// The default feed callback.
function createFeedCallback( feedItems ) {
	return feedText => {
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

// Checks if position in inside or right after a text with a mention.
//
// @param {module:engine/model/position~Position} position.
// @returns {Boolean}
function hasExistingMention( position ) {
	// The text watcher listens only to changed range in selection - so the selection attributes are not yet available
	// and you cannot use selection.hasAttribute( 'mention' ) just yet.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/1723.
	const hasMention = position.textNode && position.textNode.hasAttribute( 'mention' );

	const nodeBefore = position.nodeBefore;

	return hasMention || nodeBefore && nodeBefore.is( '$text' ) && nodeBefore.hasAttribute( 'mention' );
}

// Checks if string is a valid mention marker.
//
// @param {String} marker
// @returns {Boolean}
function isValidMentionMarker( marker ) {
	return marker && marker.length == 1;
}

// Checks the mention plugins is in completion mode (e.g. when typing is after a valid mention string like @foo).
//
// @returns {Boolean}
function checkIfStillInCompletionMode( editor ) {
	return editor.model.markers.has( 'mention' );
}
