/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style-custom' ), {
		image: {
			styles: [
				// This option is equal to a situation where no style is applied.
				'full',

				// This represents an image aligned to left.
				'alignLeft',

				// This represents an image aligned to right.
				'alignRight'
			],

			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ]
		},
		toolbar: {
			viewportTopOffset: 60
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorStyleCustom = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
