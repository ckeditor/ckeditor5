/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-semantical-image-style-default' ), {
		removePlugins: [ 'imageCaption' ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		cloudServices: CS_CONFIG,
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side' ]
		}
	} )
	.then( editor => {
		window.editorStyleSemantical = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
