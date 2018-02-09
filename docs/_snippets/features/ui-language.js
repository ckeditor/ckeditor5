/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

/* config { "language": "de" } */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

ClassicEditor
	.create( document.querySelector( '#snippet-ui-language' ), {
		cloudServices: {
			tokenUrl: TOKEN_URL
		},
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
