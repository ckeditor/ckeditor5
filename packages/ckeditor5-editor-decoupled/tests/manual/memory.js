/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import DecoupledEditor from '../../src/decouplededitor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

const editorData = '<h2>Hello world</h2><p>This is the decoupled editor.</p><img src="sample.jpg" />';

/*
 * Memory-leak safe version of decoupled editor manual test does not:
 * - define global variables (such as let editor; in main file scope)
 * - console.log() objects
 * - add event listeners with () => {} methods which reference other
 */
function initEditor() {
	DecoupledEditor
		.create( editorData, {
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
					'imageStyle:full',
					'imageStyle:side',
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
			window.editor = newEditor;

			document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );
			document.querySelector( '.editable-container' ).appendChild( newEditor.ui.view.editable.element );

			document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );

	function destroyEditor() {
		window.editor.destroy().then( () => console.log( 'Editor was destroyed' ) );
		window.editor = null;
		document.getElementById( 'destroyEditor' ).removeEventListener( 'click', destroyEditor );
	}
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
