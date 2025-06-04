/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Mention from '../../src/mention.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Font from '@ckeditor/ckeditor5-font/src/font.js';

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
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
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
	const useCache = document.querySelector( '#cache-control' ).checked;

	if ( useCache && cache.has( text ) ) {
		console.log( `Loading from cache for: "${ text }".` );

		return cache.get( text );
	}

	const fetchOptions = {
		method: 'get',
		mode: 'cors'
	};

	return fetch( `http://localhost:3000?search=${ text }`, fetchOptions )
		.then( response => {
			const feedItems = response.json();

			if ( useCache ) {
				cache.set( text, feedItems );
			}

			return feedItems;
		} );
}
