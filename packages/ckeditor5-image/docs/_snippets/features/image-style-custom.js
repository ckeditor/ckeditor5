/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import './image-style-custom.scss';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style-custom' ), {
		image: {
			styles: [
				// This option is equal to a situation where no style is applied.
				'imageStyleFull',

				// This represents an image aligned to left.
				'imageStyleAlignLeft',

				// This represents an image aligned to right.
				'imageStyleAlignRight'
			],

			toolbar: [ 'imageTextAlternative', '|', 'imageStyleAlignLeft', 'imageStyleFull', 'imageStyleAlignRight' ]
		},
		toolbar: {
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editorStyleCustom = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
