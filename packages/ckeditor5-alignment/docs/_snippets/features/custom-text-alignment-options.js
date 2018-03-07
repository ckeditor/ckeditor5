/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

ClassicEditor
	.create( document.querySelector( '#snippet-custom-text-alignment-options' ), {
		toolbar: {
			items: [
				'headings', '|', 'bulletedList', 'numberedList', 'alignmentDropdown', 'undo', 'redo'
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
