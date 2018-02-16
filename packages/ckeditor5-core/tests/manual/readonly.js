/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '../_utils/articlepluginset';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, BalloonToolbar ],
		toolbar: [ 'headings', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ],
		},
		balloonToolbar: [ 'bold', 'italic', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#read-only' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;
			button.textContent = editor.isReadOnly ? 'Turn off read-only mode' : 'Turn on read-only mode';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

