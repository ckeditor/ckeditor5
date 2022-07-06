/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

// Editors
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

// Plugins
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import { createObserver } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

let editor;
window.editors = {};
window.editables = [];
window._observers = [];

function initClassicEditor( options ) {
	init( '#editor-classic' );

	function init( selector ) {
		ClassicEditor
			.create( document.querySelector( selector ), {
				plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ],
				label: options.editorName
			} )
			.then( editor => {
				console.log( `Editor ${ selector } was initialized`, editor );
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
			.then( () => {
				document.getElementById( 'editor-name' ).innerHTML = editor._editorName;
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}
}

function initBalloonEditor( ) {
	init( '#editor-balloon' );

	function init( selector ) {
		BalloonEditor
			.create( document.querySelector( selector ), {
				plugins: [ ArticlePluginSet ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
				image: {
					toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
				}
			} )
			.then( editor => {
				console.log( `Editor ${ selector } was initialized`, editor );
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

function initInlineEditor() {
	init( '#editor-inline' );

	function init( selector ) {
		InlineEditor
			.create( document.querySelector( selector ), {
				image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
				plugins: [ ArticlePluginSet ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
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

function initDecoupledEditor() {
	init( '#editor-decoupled' );

	function init( selector ) {
		DecoupledEditor
			.create( document.querySelector( selector ), {
				plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
				toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
			} )
			.then( editor => {
				console.log( `${ selector } has been initialized`, editor );
				console.log( 'It has been added to global `editors` and `editables`.' );

				document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
				document.querySelector( '.editable-container' ).appendChild( editor.ui.view.editable.element );

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

document.getElementById( 'initClassicEditor' ).addEventListener( 'click', initClassicEditor );
initClassicEditor( { editorName: 'test' } );
initBalloonEditor();
initInlineEditor();
initDecoupledEditor();
