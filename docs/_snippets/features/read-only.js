/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		cloudServices: {
			tokenUrl: TOKEN_URL
		},
		toolbar: {
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#snippet-read-only-toggle' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;

			button.innerText = editor.isReadOnly ? 'Switch to editable mode' : 'Switch to read-only mode';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
