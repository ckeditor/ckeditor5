/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InlineEditor from '../../src/inlineeditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

window.editors = {};
window.editables = [];
window._observers = [];

function initEditors() {
	init( '#editor-1' );
	init( '#editor-2' );

	function init( selector ) {
		InlineEditor
			.create( document.querySelector( selector ), {
				image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
				plugins: [ ArticlePluginSet ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
				menuBar: { isVisible: true }
			} )
			.then( editor => {
				console.log( `${ selector } has been initialized`, editor );
				console.log( 'It has been added to global `editors` and `editables`.' );

				window.editors[ selector ] = editor;
				window.editables.push( editor.editing.view.document.getRoot() );

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
		window.editors[ selector ].destroy().then( () => {
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
