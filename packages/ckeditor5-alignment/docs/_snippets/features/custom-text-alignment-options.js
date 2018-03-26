/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-custom-text-alignment-options' ), {
		toolbar: {
			items: [
				'heading', '|', 'bulletedList', 'numberedList', 'alignment', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		alignment: {
			options: [ 'left', 'right' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
