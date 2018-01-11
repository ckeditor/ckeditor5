/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style' ), {
		toolbar: {
			viewportTopOffset: 60
		},
		cloudServices: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editorStyle = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
