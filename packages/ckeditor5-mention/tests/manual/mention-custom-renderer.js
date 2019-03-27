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
import Mention from '../../src/mention';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Heading, Link, Bold, Italic, Underline, Undo, Clipboard, Widget, ShiftEnter, Table, Mention ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'underline', 'link', '|', 'insertTable', '|', 'undo', 'redo' ],
		mention: {
			feeds: [
				{
					feed: getFeed,
					itemRenderer: item => {
						const span = global.document.createElementNS( 'http://www.w3.org/1999/xhtml', 'span' );

						span.classList.add( 'custom-item' );
						span.id = `mention-list-item-id-${ item.id }`;

						span.innerHTML = `${ item.name } <span class="custom-item-username">@${ item.username }</span>`;

						return span;
					}
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getFeed( feedText ) {
	return Promise.resolve( [
		{ id: '1', name: 'Barney Stinson', username: 'swarley' },
		{ id: '2', name: 'Lily Aldrin', username: 'lilypad' },
		{ id: '3', name: 'Marshall Eriksen', username: 'marshmallow' },
		{ id: '4', name: 'Robin Scherbatsky', username: 'rsparkles' },
		{ id: '5', name: 'Ted Mosby', username: 'tdog' }
	].filter( item => {
		const searchString = feedText.toLowerCase();

		return item.name.toLowerCase().includes( searchString ) || item.username.toLowerCase().includes( searchString );
	} ) );
}
