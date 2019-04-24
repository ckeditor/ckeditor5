/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console, window, fetch, document */

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
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: getFeed,
					itemRenderer: ( { fullName, id, thumbnail } ) => {
						const div = document.createElement( 'div' );

						div.classList.add( 'custom' );
						div.classList.add( 'mention__item' );

						div.innerHTML =
							`<img class="mention__item__thumbnail" src="${ thumbnail }">` +
							'<div class="mention__item__body">' +
								`<span class="mention__item__full-name">${ fullName }</span>` +
								`<span class="mention__item__username">${ id }</span>` +
							'</div>';

						return div;
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

// Simplest cache:
const cache = new Map();

function getFeed( text ) {
	if ( cache.has( text ) ) {
		return cache.get( text );
	}

	const fetchOptions = {
		method: 'get',
		mode: 'cors'
	};

	return fetch( `http://localhost:3000?search=${ text }`, fetchOptions )
		.then( response => {
			const feedItems = response.json();

			cache.set( text, feedItems );

			return feedItems;
		} );
}
