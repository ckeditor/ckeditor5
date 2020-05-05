/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, window, console, $ */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

// Display an info when this file is ran as a standalone test.
if ( window.top === window ) {
	document.getElementById( 'info' ).style.display = 'block';
} else {
	BalloonEditor
		.create( document.querySelector( '#editor' ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [ 'bold', 'link' ]
		} )
		.then( editor => {
			window.editor = editor;

			$( '#modal' ).modal( {
				// Make sure the modal does not steal the input focus (e.g. when editing a link).
				// https://github.com/ckeditor/ckeditor5/issues/1147
				focus: false
			} );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
