/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/mentionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import TextWatcher from '@ckeditor/ckeditor5-typing/src/textwatcher';

import MentionsView from './ui/mentionsview';
import DomWrapperView from './ui/domwrapperview';
import MentionListItemView from './ui/mentionlistitemview';

const VERTICAL_SPACING = 3;

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

		editor.config.define( 'mention', { feeds: [] } );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

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

				if ( data.keyCode == keyCodes.enter || data.keyCode == keyCodes.tab || data.keyCode == keyCodes.space ) {
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

			if ( !marker || marker.length != 1 ) {
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
				 */
				throw new CKEditorError(
					'mentionconfig-incorrect-marker: The marker must be provided and it must be a single character.',
					null
				);
			}

			const minimumCharacters = mentionDescription.minimumCharacters || 0;
			const feedCallback = typeof feed == 'function' ? feed.bind( this.editor ) : createFeedCallback( feed );
			const watcher = this._setupTextWatcherForFeed( marker, minimumCharacters );
			const itemRenderer = mentionDescription.itemRenderer;

			const definition = { watcher, marker, feedCallback, itemRenderer };

			this._mentionsConfigurations.set( marker, definition );
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
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
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
	 * Returns a promise that resolves with autocomplete items for a given text.
	 *
	 * @param {String} marker
	 * @param {String} feedText
	 * @return {Promise<module:mention/mention~MentionFeedItem>}
	 * @private
	 */
	_getFeed( marker, feedText ) {
		const { feedCallback } = this._mentionsConfigurations.get( marker );

		return Promise.resolve().then( () => feedCallback( feedText ) );
	}

	/**
	 * Registers a text watcher for the marker.
	 *
	 * @private
	 * @param {String} marker
	 * @param {Number} minimumCharacters
	 * @returns {module:typing/textwatcher~TextWatcher}
	 */
	_setupTextWatcherForFeed( marker, minimumCharacters ) {
		const editor = this.editor;

		const watcher = new TextWatcher( editor.model, createTestCallback( marker, minimumCharacters ) );

		watcher.on( 'matched', ( evt, data ) => {
			const selection = editor.model.document.selection;
			const focus = selection.focus;

			// The text watcher listens only to changed range in selection - so the selection attributes are not yet available
			// and you cannot use selection.hasAttribute( 'mention' ) just yet.
			// See https://github.com/ckeditor/ckeditor5-engine/issues/1723.
			const hasMention = focus.textNode && focus.textNode.hasAttribute( 'mention' );

			const nodeBefore = focus.nodeBefore;

			if ( hasMention || nodeBefore && nodeBefore.is( 'text' ) && nodeBefore.hasAttribute( 'mention' ) ) {
				this._hideUIAndRemoveMarker();

				return;
			}

			const feedText = getFeedText( marker, data.text );
			const matchedTextLength = marker.length + feedText.length;

			// Create a marker range.
			const start = focus.getShiftedBy( -matchedTextLength );
			const end = focus.getShiftedBy( -feedText.length );

			const markerRange = editor.model.createRange( start, end );

			let mentionMarker;

			if ( editor.model.markers.has( 'mention' ) ) {
				mentionMarker = editor.model.markers.get( 'mention' );
			} else {
				mentionMarker = editor.model.change( writer => writer.addMarker( 'mention', {
					range: markerRange,
					usingOperation: false,
					affectsData: false
				} ) );
			}

			this._getFeed( marker, feedText )
				.then( feed => {
					this._items.clear();

					for ( const feedItem of feed ) {
						const item = typeof feedItem != 'object' ? { id: feedItem, text: feedItem } : feedItem;

						this._items.add( { item, marker } );
					}

					if ( this._items.length ) {
						this._showUI( mentionMarker );
					} else {
						this._hideUIAndRemoveMarker();
					}
				} );
		} );

		watcher.on( 'unmatched', () => {
			this._hideUIAndRemoveMarker();
		} );

		return watcher;
	}

	/**
	 * Shows the mentions balloon. If the panel is already visible, it will reposition it.
	 *
	 * @private
	 */
	_showUI( markerMarker ) {
		if ( this._isUIVisible ) {
			// Update balloon position as the mention list view may change its size.
			this._balloon.updatePosition( this._getBalloonPanelPositionData( markerMarker, this._mentionsView.position ) );
		} else {
			this._balloon.add( {
				view: this._mentionsView,
				position: this._getBalloonPanelPositionData( markerMarker, this._mentionsView.position ),
				withArrow: false,
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

		if ( this.editor.model.markers.has( 'mention' ) ) {
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
		const editing = this.editor.editing;
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
				name: 'caret_se'
			};
		},

		// Positions the panel to the northeast of the caret rectangle.
		'caret_ne': ( targetRect, balloonRect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right,
				name: 'caret_ne'
			};
		},

		// Positions the panel to the southwest of the caret rectangle.
		'caret_sw': ( targetRect, balloonRect ) => {
			return {
				top: targetRect.bottom + VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_sw'
			};
		},

		// Positions the panel to the northwest of the caret rect.
		'caret_nw': ( targetRect, balloonRect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_nw'
			};
		}
	};

	// Returns only the last position if it was matched to prevent the panel from jumping after the first match.
	if ( positions.hasOwnProperty( preferredPosition ) ) {
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
	const mentionCharacters = env.features.isRegExpUnicodePropertySupported ? '\\p{L}\\p{N}' : 'a-zA-ZÀ-ž0-9';

	// The pattern consists of 3 groups:
	// - 0 (non-capturing): Opening sequence - start of the line, space or an opening punctuation character like "(" or "\"",
	// - 1: The marker character,
	// - 2: Mention input (taking the minimal length into consideration to trigger the UI),
	//
	// The pattern matches up to the caret (end of string switch - $).
	//               (0:      opening sequence       )(1:  marker   )(2:                typed mention                 )$
	const pattern = `(?:^|[ ${ openAfterCharacters }])([${ marker }])([_${ mentionCharacters }]${ numberOfCharacters })$`;

	return new RegExp( pattern, 'u' );
}

// Creates a test callback for the marker to be used in the text watcher instance.
//
// @param {String} marker
// @param {Number} minimumCharacters
// @returns {Function}
function createTestCallback( marker, minimumCharacters ) {
	const regExp = createRegExp( marker, minimumCharacters );

	return text => regExp.test( text );
}

// Creates a text matcher from the marker.
//
// @param {String} marker
// @returns {Function}
function getFeedText( marker, text ) {
	const regExp = createRegExp( marker, 0 );

	const match = text.match( regExp );

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
			} )
			// Do not return more than 10 items.
			.slice( 0, 10 );

		return Promise.resolve( filteredItems );
	};
}

// Checks if a given key code is handled by the mention UI.
//
// @param {Number}
// @returns {Boolean}
function isHandledKey( keyCode ) {
	const handledKeyCodes = [
		keyCodes.arrowup,
		keyCodes.arrowdown,
		keyCodes.enter,
		keyCodes.tab,
		keyCodes.space,
		keyCodes.esc
	];

	return handledKeyCodes.includes( keyCode );
}
