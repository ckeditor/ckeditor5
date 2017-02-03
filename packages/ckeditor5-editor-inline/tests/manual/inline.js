/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import InlineEditor from '../../src/inline';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import testUtils from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

window.editors = {};
window.editables = [];
window._observers = [];

function initEditors() {
	init( '#editor-1' );
	init( '#editor-2' );

	function init( selector ) {
		InlineEditor.create( document.querySelector( selector ), {
			plugins: [ Link, Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo', 'link', 'unlink' ]
		} )
		.then( editor => {
			console.log( `${ selector } has been initialized`, editor );
			console.log( 'It has been added to global `editors` and `editables`.' );

			window.editors[ selector ] = editor;
			window.editables.push( editor.editing.view.getRoot() );

			let observer = testUtils.createObserver();

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
	for ( let selector in window.editors ) {
		window.editors[ selector ].destroy().then( () => {
			console.log( `${ selector } was destroyed.` );
		} );
	}

	for ( let observer of window._observers ) {
		observer.stopListening();
	}

	window.editors = {};
	window.editables.length = window._observers.length = 0;
}

document.getElementById( 'initEditors' ).addEventListener( 'click', initEditors );
document.getElementById( 'destroyEditors' ).addEventListener( 'click', destroyEditors );
