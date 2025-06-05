/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '../../src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

/*
 * Memory-leak safe version of classic editor manual test does not:
 * - define global variables (such as let editor; in main file scope)
 * - console.log() objects
 * - add event listeners with () => {} methods which reference other
 */
function initEditor() {
	let editor;

	ClassicEditor
		.create( document.querySelector( '#editor' ), {
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
		.then( newEditor => {
			editor = newEditor;

			document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );

	function destroyEditor() {
		editor.destroy().then( () => console.log( 'Editor was destroyed' ) );
		editor = null;
		document.getElementById( 'destroyEditor' ).removeEventListener( 'click', destroyEditor );
	}
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
