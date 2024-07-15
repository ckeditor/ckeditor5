/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import BalloonEditor from '../../src/ballooneditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

window.editors = {};
window.editables = [];
window._observers = [];

function initEditors() {
	init( '#editor-1' );
	init( '#editor-2' );

	function init( selector ) {
		BalloonEditor
			.create( document.querySelector( selector ), {
				plugins: [ ArticlePluginSet ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
				image: {
					toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
				}
			} )
			.then( editor => {
				console.log( `${ selector } has been initialized`, editor );
				console.log( 'It has been added to global `editors` and `editables`.' );

				window.editors[ selector ] = editor;
				window.editables.push( editor.editing.view.document.getRoot() );

				const editorNumber = selector.split( '-' )[ 1 ];
				document.querySelector( `#menubar-container-${ editorNumber }` ).appendChild( editor.ui.view.menuBarView.element );

				const observer = createObserver();

				observer.observe(
					`${ selector }.ui.focusTracker`,
					editor.ui.focusTracker,
					[ 'isFocused' ]
				);

				window._observers.push( observer );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}
}

function destroyEditors() {
	for ( const selector in window.editors ) {
		const editor = window.editors[ selector ];

		editor.destroy().then( () => {
			editor.ui.view.menuBarView.element.remove();

			console.log( `${ selector } was destroyed.` );
		} );
	}

	for ( const observer of window._observers ) {
		observer.stopListening();
	}

	window.editors = {};
	window.editables.length = window._observers.length = 0;
}

document.getElementById( 'initEditors' ).addEventListener( 'click', initEditors );
document.getElementById( 'destroyEditors' ).addEventListener( 'click', destroyEditors );
