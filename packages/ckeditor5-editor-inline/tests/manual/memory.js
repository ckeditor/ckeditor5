/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InlineEditor from '../../src/inlineeditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

/*
 * Memory-leak safe version of inline editor manual test does not:
 * - define global variables (such as let editor; in main file scope)
 * - console.log() objects
 * - add event listeners with () => {} methods which reference other
 */
function initEditors() {
	const editors = {};

	init( '#editor-1' );
	init( '#editor-2' );

	document.getElementById( 'destroyEditors' ).addEventListener( 'click', destroyEditors );

	function init( selector ) {
		InlineEditor
			.create( document.querySelector( selector ), {
				plugins: [ ArticlePluginSet ],
				toolbar: {
					items: [
						'heading',
						'|',
						'bold',
						'italic',
						'link',
						'bulletedList',
						'numberedList',
						'blockQuote',
						'insertTable',
						'mediaEmbed',
						'undo',
						'redo'
					]
				},
				image: {
					toolbar: [
						'imageStyle:inline',
						'imageStyle:block',
						'imageStyle:wrapText',
						'|',
						'imageTextAlternative'
					]
				},
				table: {
					contentToolbar: [
						'tableColumn',
						'tableRow',
						'mergeTableCells'
					]
				}
			} )
			.then( editor => {
				editors[ selector ] = editor;
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}

	function destroyEditors() {
		for ( const selector in editors ) {
			editors[ selector ].destroy().then( () => {
				editors[ selector ] = undefined;
			} );
		}

		document.getElementById( 'destroyEditors' ).removeEventListener( 'click', destroyEditors );
	}
}

document.getElementById( 'initEditors' ).addEventListener( 'click', initEditors );
