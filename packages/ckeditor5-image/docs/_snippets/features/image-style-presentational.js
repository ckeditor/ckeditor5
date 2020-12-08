/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-style-custom' ), {
		removePlugins: [ 'LinkImage', 'AutoImage' ],
		image: {
			styles: [
				'alignLeft',
				'alignCenter',
				'alignRight'
			],
			resizeOptions: [
				{
					name: 'imageResize:original',
					label: 'Original',
					value: null
				},
				{
					name: 'imageResize:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'imageResize:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:alignCenter',
				'imageStyle:alignRight',
				'|',
				'imageResize',
				'|',
				'imageTextAlternative'
			]
		},
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorStyleCustom = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
