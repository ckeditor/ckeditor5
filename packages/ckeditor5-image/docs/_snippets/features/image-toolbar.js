/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-toolbar' ), {
		removePlugins: [ 'ImageCaption', 'ImageStyle' ],
		image: {
			toolbar: [ 'imageTextAlternative' ]
		},
		toolbar: {
			viewportTopOffset: 60
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorToolbar = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
