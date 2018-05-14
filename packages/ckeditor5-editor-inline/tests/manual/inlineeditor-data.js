/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import InlineEditor from '../../src/inlineeditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

window.editors = [];

function initEditor() {
	InlineEditor
		.create( '<h2>Editor 1</h2><p>This is an editor instance.</p>', {
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
		} )
		.then( editor => {
			window.editors.push( editor );
			document.body.appendChild( editor.element );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function destroyEditor() {
	window.editors.forEach( editor => {
		editor.destroy()
			.then( () => {
				editor.element.remove();
			} );
	} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
