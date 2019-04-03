/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Mention from '../../src/mention';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Font from '@ckeditor/ckeditor5-font/src/font';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Underline, Font, Mention ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'underline', 'link',
			'|', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'|', 'insertTable',
			'|', 'undo', 'redo'
		],
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
