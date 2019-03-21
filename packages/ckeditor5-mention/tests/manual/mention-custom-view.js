/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

import MentionUI from '../../src/mentionui';
import MentionEditing from '../../src/mentionediting';

const HIGHER_THEN_HIGHEST = priorities.highest + 50;

class CustomMentionAttributeView extends Plugin {
	init() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'a',
				key: 'data-mention',
				classes: 'mention',
				attributes: {
					href: true
				}
			},
			model: {
				key: 'mention',
				value: viewItem => {
					const mentionValue = {
						name: viewItem.getAttribute( 'data-mention' ),
						link: viewItem.getAttribute( 'href' )
					};

					return mentionValue;
				}
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: ( modelAttributeValue, viewWriter ) => {
				if ( !modelAttributeValue ) {
					return;
				}

				return viewWriter.createAttributeElement( 'a', {
					class: 'mention',
					'data-mention': modelAttributeValue.name,
					'href': modelAttributeValue.link
				} );
			},
			converterPriority: HIGHER_THEN_HIGHEST
		} );
	}
}

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Link, Heading, Bold, Italic, Underline, Undo, Clipboard, Widget, ShiftEnter, Table,
			MentionEditing, CustomMentionAttributeView, MentionUI ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'underline', 'link', '|', 'insertTable', '|', 'undo', 'redo' ],
		mention: [
			{
				feed: getFeed
			}
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getFeed( feedText ) {
	return [
		{ id: '1', name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' },
		{ id: '2', name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989' },
		{ id: '3', name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' },
		{ id: '4', name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' },
		{ id: '5', name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }
	].filter( item => {
		const searchString = feedText.toLowerCase();

		return item.name.toLowerCase().includes( searchString );
	} );
}
