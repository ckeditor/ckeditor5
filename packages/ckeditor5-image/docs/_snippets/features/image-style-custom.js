/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style-custom' ), {
		image: {
			styles: [
				// This option is equal to a situation where no style is applied.
				'imageStyle:full',

				// This represents an image aligned to left.
				'imageStyle:alignLeft',

				// This represents an image aligned to right.
				'imageStyle:alignRight'
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
