/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-resize' ), {
		removePlugins: [ 'LinkImage', 'AutoImage' ],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'alignLeft',
				'alignCenter',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:alignCenter',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorResize = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
