/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-resize-buttons' ), {
		removePlugins: [ 'LinkImage', 'AutoImage' ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		image: {
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null,
					icon: 'original'
				},
				{
					name: 'resizeImage:20',
					label: '20%',
					value: '20',
					icon: 'medium'
				},
				{
					name: 'resizeImage:40',
					label: '40%',
					value: '40',
					icon: 'large'
				}
			],
			toolbar: [
				'resizeImage:20',
				'resizeImage:40',
				'resizeImage:original'
			]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorResizeUI = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
