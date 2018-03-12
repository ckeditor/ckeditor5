/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

ClassicEditor
	.create( document.querySelector( '#snippet-custom-font-size-numeric-options' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'heading', '|', 'fontSize', 'bulletedList', 'numberedList', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		fontSize: {
			options: [
				9,
				11,
				13,
				'normal',
				17,
				19,
				21
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
