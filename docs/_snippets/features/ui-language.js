/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

/* config { "language": "de" } */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

ClassicEditor
	.create( document.querySelector( '#snippet-ui-language' ), {
		toolbar: {
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
