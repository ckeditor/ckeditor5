/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

/* globals ClassicEditor, console, window, document */
ClassicEditor
	.create( document.querySelector( '#snippet-custom-font-family-options' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'heading', '|', 'fontFamily', 'bulletedList', 'numberedList', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		fontFamily: {
			options: [
				'default',
				'Ubuntu, Arial, sans-serif',
				'Ubuntu Mono, Courier New, Courier, monospace'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
