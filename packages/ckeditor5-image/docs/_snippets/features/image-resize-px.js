/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-resize-px' ), {
		removePlugins: [ 'LinkImage', 'AutoImage' ],
		image: {
			resizeUnit: 'px',
			resizeOptions: [
				{
					name: 'imageResize:original',
					label: 'Original',
					value: null
				},
				{
					name: 'imageResize:250',
					label: '250px',
					value: '250'
				},
				{
					name: 'imageResize:400',
					label: '400px',
					value: '400'
				}
			],
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
				'imageResize'
			]
		},
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorResizePX = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
