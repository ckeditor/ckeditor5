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
import View from '@ckeditor/ckeditor5-ui/src/view';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ListView from '@ckeditor/ckeditor5-ui/src/list/listview';
import ListItemView from '@ckeditor/ckeditor5-ui/src/list/listitemview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

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
	static get requries() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		const locale = editor.locale;

		// this._panel = editor.plugins.get( 'ContextualBalloon' );

		this._panel = new BalloonPanelView( locale );
		this._panel.withArrow = false;
		this._panel.render();

		// document.body.appendChild( this._panel.element );
		this.editor.ui.view.body.add( this._panel );

		this._mentions = new MentionsView( locale );
		// this._mentions.render();

		const items = new Collection();

		this._panel.content.add( this._mentions );

		this._mentions.listView.items.bindTo( items ).using( item => {
			const { label } = item;
			const listItemView = new ListItemView( locale );
			const buttonView = new ButtonView( locale );

			buttonView.label = label;
			buttonView.withText = true;
			buttonView.item = item;

			listItemView.children.add( buttonView );

			buttonView.delegate( 'execute' ).to( this._mentions );

			return listItemView;
		} );

		const regExp = / (@)([\w]*?)$/;

		const watcher = new TextWatcher( editor, testCallback );

		this._mentions.on( 'execute', evt => {
			const label = evt.source.label;

			const text = watcher.last;

			if ( !text ) {
				return;
			}

			const matched = getMatchedText( text );

			editor.model.change( writer => {
				const end = writer.createPositionAt( editor.model.document.selection.focus );
				const start = end.getShiftedBy( -( 1 + matched.feedText.length ) );

				const range = writer.createRange( start, end );

				writer.setAttribute( 'mention', label, range );
				writer.remove( range );

				writer.insertText( `@${ label }`, { mention: 'label' }, start );
				writer.insertText( ' ', editor.model.document.selection.focus );
			} );
		} );

		function testCallback( text ) {
			return regExp.test( text );
		}

		function getMatchedText( text ) {
			const match = text.match( regExp );

			const marker = match[ 1 ];
			const feedText = match[ 2 ];

			return { marker, feedText };
		}

		watcher.on( 'matched', ( evt, data ) => {
			const text = data.text;

			const matched = getMatchedText( text );

			items.clear();

			const feed = [ 'Jodator', 'Foo', 'Bar' ];

			const strings = feed.filter( item => {
				return item.toLowerCase().startsWith( matched.feedText.toLowerCase() );
			} );

			for ( const item of strings ) {
				items.add( { label: item } );
			}

			this._showForm();
		} );

		watcher.on( 'unmatched', () => {
			this._hideForm();
		} );
	}

	_showForm() {
		if ( this._isVisible ) {
			// return;
		}

		const editor = this.editor;

		// Pin the panel to an element with the "target" id DOM.
		this._panel.pin( getBalloonPositionData( editor ) );

		this._panel.show();
	}

	_hideForm() {
		this._panel.hide();
	}
}

// Returns whole text from parent element by adding all data from text nodes together.
//
// @private
// @param {module:engine/model/element~Element} element
// @returns {String}
function getText( element ) {
	return Array.from( element.getChildren() ).reduce( ( a, b ) => a + b.data, '' );
}

class TextWatcher {
	constructor( editor, callbackOrRegex ) {
		this.editor = editor;
		this.testCallback = callbackOrRegex;

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
			if ( changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1 ) {
				return undefined;
			}

			const text = this._getText();

			const textHasMatch = this.testCallback( text );

			if ( !textHasMatch && this.hasMatch ) {
				this.fire( 'unmatched' );
			}

			this.hasMatch = textHasMatch;

			if ( textHasMatch ) {
				this.fire( 'matched', { text } );
			}
		} );

		this._panel = this.editor.plugins.get( 'ContextualBalloon' );
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

class MentionsView extends View {
	constructor( locale ) {
		super( locale );

		this.listView = new ListView( locale );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-mention'
				],

				tabindex: '-1'
			},

			children: [
				this.listView
			]
		} );
	}
}

function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;

	return {
		target: () => {
			// const text = editingView.domConverter.findCorrespondingDomText( editingView.document.selection.focus.parent );
			const textParent = editingView.domConverter.viewToDom( editingView.document.selection.focus.parent.parent );

			return textParent;
		},
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}
