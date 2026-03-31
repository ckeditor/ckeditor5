/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { BalloonEditor } from '../../src/ballooneditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

window.editors = [];
const container = document.querySelector( '.container' );
let counter = 1;

function initEditor() {
	BalloonEditor
		.create( {
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
			root: {
				initialData: `<h2>Editor ${ counter }</h2><p>This is an editor instance.</p>`
			}
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
