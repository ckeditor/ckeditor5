/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListItemView from '@ckeditor/ckeditor5-ui/src/list/listitemview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import View from '@ckeditor/ckeditor5-ui/src/view';

import MentionsView from './ui/mentionsview';
import TextWatcher from './textwatcher';

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

				if ( data.keyCode == keyCodes.enter || data.keyCode == keyCodes.tab ) {
					this._mentionsView.executeSelected();
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
			const { label } = item;

			const renderer = this._getItemRenderer( marker );

			const listItemView = new MentionListItemView( editor.locale );

			if ( renderer ) {
				const domNode = renderer( item );

				const domWrapperView = new DomWrapperView( editor.locale, domNode );
				domWrapperView.delegate( 'execute' ).to( listItemView );
				listItemView.children.add( domWrapperView );
			} else {
				const buttonView = new ButtonView( editor.locale );

				buttonView.label = label;
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
			const label = item.label || item;
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
				mention: label,
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

		return feedCallback( feedText );
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

					for ( const label of feed ) {
						const item = typeof label != 'object' ? { label } : label;

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
		this.panelView.pin( this._getBalloonPositionData() );
		this.panelView.show();
		this._mentionsView.selectFirst();
	}

	_hidePanel() {
		this.panelView.unpin();
		this.panelView.hide();
	}

	// TODO copied from balloontoolbar
	_getBalloonPositionData() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const viewSelection = viewDocument.selection;

		return {
			// Because the target for BalloonPanelView is a Rect (not DOMRange), it's geometry will stay fixed
			// as the window scrolls. To let the BalloonPanelView follow such Rect, is must be continuously
			// computed and hence, the target is defined as a function instead of a static value.
			// https://github.com/ckeditor/ckeditor5-ui/issues/195
			target: () => {
				const range = viewSelection.getLastRange();
				const rangeRects = Rect.getDomRangeRects( view.domConverter.viewRangeToDom( range ) );

				if ( rangeRects.length > 1 && rangeRects[ rangeRects.length - 1 ].width === 0 ) {
					rangeRects.pop();
				}

				return rangeRects[ rangeRects.length - 1 ];
			},
			positions: getBalloonPositions()
		};
	}
}

function getBalloonPositions() {
	const defaultPositions = BalloonPanelView.defaultPositions;

	return [
		defaultPositions.southArrowNorthWest,
		defaultPositions.northArrowSouthWest
	];
}

function createPattern( marker ) {
	return ` (${ marker })([\\w]*?)$`;
}

function createTestCallback( marker ) {
	const regExp = new RegExp( createPattern( marker ) );

	return text => regExp.test( text );
}

function createTextMatcher( marker ) {
	const regExp = new RegExp( createPattern( marker ) );

	return text => {
		const match = text.match( regExp );

		const marker = match[ 1 ];
		const feedText = match[ 2 ];

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

class DomWrapperView extends View {
	constructor( locale, domNode ) {
		super( locale );

		this.template = false;
		this.domNode = domNode;

		this.domNode.classList.add( 'ck-button' );

		this.set( 'isOn', false );

		this.on( 'change:isOn', ( evt, name, isOn ) => {
			if ( isOn ) {
				this.domNode.classList.add( 'ck-on' );
				this.domNode.classList.remove( 'ck-off' );
			} else {
				this.domNode.classList.add( 'ck-off' );
				this.domNode.classList.remove( 'ck-on' );
			}
		} );
	}

	render() {
		super.render();

		this.element = this.domNode;
	}
}

function isHandledKey( keyCode ) {
	const handledKeyCodes = [
		keyCodes.arrowup,
		keyCodes.arrowdown,
		keyCodes.arrowleft,
		keyCodes.arrowright,
		keyCodes.enter,
		keyCodes.tab
	];
	return handledKeyCodes.includes( keyCode );
}

class MentionListItemView extends ListItemView {
	highlight() {
		const child = this.children.first;

		child.isOn = true;
	}

	removeHighlight() {
		const child = this.children.first;

		child.isOn = false;
	}
}
