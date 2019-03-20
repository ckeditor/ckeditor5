/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import MentionsView from './ui/mentionsview';
import DomWrapperView from './ui/domwrapperview';
import TextWatcher from './textwatcher';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import MentionListItemView from './ui/mentionlistitemview';

const VERTICAL_SPACING = 5;

/**
 * The mention ui feature.
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

	constructor( editor ) {
		super( editor );

		editor.config.define( 'mention', [] );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		this.panelView = new BalloonPanelView( editor.locale );
		this.panelView.withArrow = false;
		this.panelView.render();

		this.editor.ui.view.body.add( this.panelView );

		this._createMentionView( editor );

		this.editor.editing.view.document.on( 'keydown', ( evt, data ) => {
			if ( isHandledKey( data.keyCode ) && this.panelView.isVisible ) {
				data.preventDefault();
				evt.stop(); // Required for enter overriding.

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
					this._hidePanel();
				}
			}
		}, { priority: 'highest' } ); // priority highest required for enter overriding.

		this._mentionsConfigurations = new Map();

		const config = this.editor.config.get( 'mention' );

		for ( const mentionDescription of config ) {
			const feed = mentionDescription.feed;

			const marker = mentionDescription.marker || '@';
			const feedCallback = typeof feed == 'function' ? feed : createFeedCallback( feed );
			const watcher = this._addTextWatcher( marker );
			const itemRenderer = mentionDescription.itemRenderer;

			const definition = { watcher, marker, feedCallback, itemRenderer };

			this._mentionsConfigurations.set( marker, definition );
		}
	}

	_createMentionView( editor ) {
		this._mentionsView = new MentionsView( editor.locale );

		this._items = new Collection();

		this.panelView.content.add( this._mentionsView );

		// TODO this is huge rewrite:
		this._mentionsView.listView.items.bindTo( this._items ).using( data => {
			// itemRenderer
			const { item, marker } = data;
			const { name } = item;

			const listItemView = new MentionListItemView( editor.locale );

			const renderer = this._getItemRenderer( marker );

			if ( renderer ) {
				const domNode = renderer( item );

				const domWrapperView = new DomWrapperView( editor.locale, domNode );
				domWrapperView.delegate( 'execute' ).to( listItemView );
				listItemView.children.add( domWrapperView );
			} else {
				const buttonView = new ButtonView( editor.locale );

				buttonView.label = name;
				buttonView.withText = true;

				listItemView.children.add( buttonView );

				buttonView.delegate( 'execute' ).to( listItemView );
			}

			listItemView.item = item;
			listItemView.marker = marker;

			// TODO maybe delegate would be better.
			listItemView.on( 'execute', () => {
				this._mentionsView.fire( 'execute', {
					item,
					marker
				} );
			} );

			return listItemView;
		} );

		this._mentionsView.on( 'execute', ( evt, data ) => {
			const item = data.item;
			const marker = data.marker;

			const watcher = this._getWatcher( marker );

			const text = watcher.last;

			if ( !text ) {
				return;
			}

			const textMatcher = createTextMatcher( marker );
			const matched = textMatcher( text );

			const end = editor.model.createPositionAt( editor.model.document.selection.focus );
			const start = end.getShiftedBy( -( 1 + matched.feedText.length ) );

			const range = editor.model.createRange( start, end );

			editor.execute( 'mention', {
				mention: item,
				marker,
				range
			} );

			this._hidePanel();
		} );
	}

	_getItemRenderer( marker ) {
		const { itemRenderer } = this._mentionsConfigurations.get( marker );

		return itemRenderer;
	}

	_getFeed( marker, feedText ) {
		const { feedCallback } = this._mentionsConfigurations.get( marker );

		return Promise.resolve().then( () => feedCallback( feedText ) );
	}

	_addTextWatcher( marker ) {
		const editor = this.editor;

		const watcher = new TextWatcher( editor, createTestCallback( marker ), createTextMatcher( marker ) );

		watcher.on( 'matched', ( evt, data ) => {
			const matched = data.matched;

			const { feedText, marker } = matched;

			// TODO: show panel {loading: true}
			// TODO: then show panel with items
			this._getFeed( marker, feedText )
				.then( feed => {
					this._items.clear();

					for ( const name of feed ) {
						const item = typeof name != 'object' ? { name } : name;

						this._items.add( { item, marker } );
					}

					// todo: Debounce...
					if ( this._items.length ) {
						this._showPanel();
					} else {
						this._hidePanel();
					}
				} );
		} );

		watcher.on( 'unmatched', () => {
			this._hidePanel();
		} );

		return watcher;
	}

	_getWatcher( marker ) {
		const { watcher } = this._mentionsConfigurations.get( marker );

		return watcher;
	}

	_showPanel() {
		this.panelView.pin( this._getBalloonPanelPositionData() );
		this.panelView.show();
		this._mentionsView.selectFirst();
	}

	_hidePanel() {
		this.panelView.unpin();
		this.panelView.hide();
	}

	/**
	 * @return {module:utils/dom/position~Options}
	 * @private
	 */
	_getBalloonPanelPositionData() {
		const editor = this.editor;
		const view = editor.editing.view;
		const domConverter = view.domConverter;
		const viewDocument = view.document;
		const viewSelection = viewDocument.selection;

		return {
			target: () => {
				const range = viewSelection.getLastRange();
				const rangeRects = Rect.getDomRangeRects( domConverter.viewRangeToDom( range ) );

				return rangeRects[ rangeRects.length - 1 ];
			},
			positions: getBalloonPanelPositions()
		};
	}
}

// Returns balloon positions data callbacks.
//
// @returns {Array.<module:utils/dom/position~Position>}
function getBalloonPanelPositions() {
	return [
		// Positions panel to the south of caret rect.
		targetRect => {
			return {
				top: targetRect.bottom + VERTICAL_SPACING,
				left: targetRect.right,
				name: 'caret_se'
			};
		},

		// Positions panel to the north of caret rect.
		( targetRect, balloonRect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right,
				name: 'caret_ne'
			};
		},

		// Positions panel to the south of caret rect.
		( targetRect, balloonRect ) => {
			return {
				top: targetRect.bottom + VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_sw'
			};
		},

		// Positions panel to the north of caret rect.
		( targetRect, balloonRect ) => {
			return {
				top: targetRect.top - balloonRect.height - VERTICAL_SPACING,
				left: targetRect.right - balloonRect.width,
				name: 'caret_nw'
			};
		}
	];
}

function createPattern( marker ) {
	const numberOfCharacters = '*';

	return `(^| )(${ marker })([_a-zA-Z0-9À-ž]${ numberOfCharacters }?)$`;
}

function createTestCallback( marker ) {
	const regExp = new RegExp( createPattern( marker ) );

	return text => regExp.test( text );
}

function createTextMatcher( marker ) {
	const regExp = new RegExp( createPattern( marker ) );

	return text => {
		const match = text.match( regExp );

		const marker = match[ 2 ];
		const feedText = match[ 3 ];

		return { marker, feedText };
	};
}

// Default feed callback
function createFeedCallback( feedItems ) {
	return feedText => {
		const filteredItems = feedItems.filter( item => {
			return item.toLowerCase().includes( feedText.toLowerCase() );
		} );

		return Promise.resolve( filteredItems );
	};
}

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
