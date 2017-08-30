/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import BalloonToolbarEditor from '@ckeditor/ckeditor5-editor-balloon-toolbar/src/balloontoolbareditor';

import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

BalloonToolbarEditor
	.create( document.querySelector( '#snippet-balloon-toolbar-editor' ), {
		plugins: [ ArticlePreset ],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
