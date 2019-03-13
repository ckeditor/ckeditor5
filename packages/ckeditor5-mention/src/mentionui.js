/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import ListItemView from '@ckeditor/ckeditor5-ui/src/list/listitemview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import MentionsView from './ui/mentionsview';

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

		this._watchers = new Map();
		this._feeds = new Map();

		// @todo read from config.
		this._addTextWatcher( '@' );
		this._addFeed( '@', feedText => {
			const items = [ 'Jodator', 'Foo', 'Bar' ];

			return items.filter( item => {
				return item.toLowerCase().startsWith( feedText.toLowerCase() );
			} );
		} );
	}

	_createMentionView( editor ) {
		this._mentionsView = new MentionsView( editor.locale );

		this._items = new Collection();

		this.panelView.content.add( this._mentionsView );

		this._mentionsView.listView.items.bindTo( this._items ).using( data => {
			const { item, marker } = data;
			const { label } = item;

			const listItemView = new ListItemView( editor.locale );
			const buttonView = new ButtonView( editor.locale );

			// TODO: might be better - pass as params.
			buttonView.label = label;
			buttonView.withText = true;
			buttonView.item = item;
			buttonView.marker = marker;

			listItemView.children.add( buttonView );

			buttonView.delegate( 'execute' ).to( this._mentionsView );

			return listItemView;
		} );

		this._mentionsView.on( 'execute', evt => {
			// @todo use event data
			const label = evt.source.label;
			const marker = evt.source.marker;

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

			this._hideForm();
		} );
	}

	_addFeed( marker, callback ) {
		this._feeds.set( marker, callback );
	}

	_getFeed( marker, feedText ) {
		return this._feeds.get( marker )( feedText );
	}

	_addTextWatcher( marker ) {
		const editor = this.editor;

		const watcher = new TextWatcher( editor, createTestCallback( marker ), createTextMatcher( marker ) );

		this._watchers.set( marker, watcher );

		watcher.on( 'matched', ( evt, data ) => {
			const matched = data.matched;

			const { feedText, marker } = matched;

			this._items.clear();

			const feed = this._getFeed( marker, feedText );

			for ( const label of feed ) {
				const item = { label };

				this._items.add( { item, marker } );
			}

			if ( this._items.length ) {
				this._showForm();
			} else {
				this._hideForm();
			}
		} );

		watcher.on( 'unmatched', () => {
			this._hideForm();
		} );
	}

	_getWatcher( marker ) {
		return this._watchers.get( marker );
	}

	_showForm() {
		if ( this._isVisible ) {
			// return;
		}

		// Pin the panel to an element with the "target" id DOM.
		this.panelView.pin( this._getBalloonPositionData() );

		this.panelView.show();
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

				// Select the proper range rect depending on the direction of the selection.
				if ( rangeRects.length > 1 && rangeRects[ rangeRects.length - 1 ].width === 0 ) {
					rangeRects.pop();
				}

				return rangeRects[ rangeRects.length - 1 ];
			},
			positions: getBalloonPositions()
		};
	}

	_hideForm() {
		this.panelView.hide();
	}
}

// Returns whole text from parent element by adding all data from text nodes together.
// @todo copied from autoformat...

// @private
// @param {module:engine/model/element~Element} element
// @returns {String}
function getText( element ) {
	return Array.from( element.getChildren() ).reduce( ( a, b ) => a + b.data, '' );
}

class TextWatcher {
	constructor( editor, callbackOrRegex, textMatcher ) {
		this.editor = editor;
		this.testCallback = callbackOrRegex;
		this.textMatcher = textMatcher;

		this.hasMatch = false;

		this._startListening();
	}

	get last() {
		return this._getText();
	}

	_startListening() {
		const editor = this.editor;

		editor.model.document.on( 'change', ( evt, batch ) => {
			if ( batch.type == 'transparent' ) {
				return;
			}

			const changes = Array.from( editor.model.document.differ.getChanges() );
			const entry = changes[ 0 ];

			// Typing is represented by only a single change.
			if ( changes.length != 1 || entry.name != '$text' || entry.length != 1 ) {
				return undefined;
			}

			const text = this._getText();

			const textHasMatch = this.testCallback( text );

			if ( !textHasMatch && this.hasMatch ) {
				this.fire( 'unmatched' );
			}

			this.hasMatch = textHasMatch;

			if ( textHasMatch ) {
				const matched = this.textMatcher( text );

				this.fire( 'matched', { text, matched } );
			}
		} );
	}

	_getText() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		// Do nothing if selection is not collapsed.
		if ( !selection.isCollapsed ) {
			return undefined;
		}

		const block = selection.focus.parent;

		return getText( block ).slice( 0, selection.focus.offset );
	}
}

mix( TextWatcher, EmitterMixin );

function getBalloonPositions() {
	const defaultPositions = BalloonPanelView.defaultPositions;

	return [
		defaultPositions.northArrowSouthWest,
		defaultPositions.southArrowNorthWest
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
