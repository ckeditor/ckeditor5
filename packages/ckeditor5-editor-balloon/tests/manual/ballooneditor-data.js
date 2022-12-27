/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import BalloonEditor from '../../src/ballooneditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

window.editors = [];
const container = document.querySelector( '.container' );
let counter = 1;

function initEditor() {
	BalloonEditor
		.create( `<h2>Editor ${ counter }</h2><p>This is an editor instance.</p>`, {
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
		} )
		.then( editor => {
			counter += 1;
			window.editors.push( editor );
			container.appendChild( editor.ui.element );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function destroyEditors() {
	window.editors.forEach( editor => {
		editor.destroy()
			.then( () => {
				editor.ui.element.remove();
			} );
	} );
	window.editors = [];
	counter = 1;
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditors' ).addEventListener( 'click', destroyEditors );
