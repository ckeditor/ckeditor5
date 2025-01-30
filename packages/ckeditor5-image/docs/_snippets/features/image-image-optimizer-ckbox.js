/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#image-optimizer-ckbox' ), {
		removePlugins: [ 'ArticlePluginSet', 'LinkImage', 'Uploadcare', 'UploadcareImageEdit' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		image: {
			toolbar: [
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'resizeImage:25',
				'resizeImage:50',
				'resizeImage:original',
				'|',
				'ckboxImageEdit'
			],
			resizeOptions: [
				{
					name: 'resizeImage:original',
					value: null,
					icon: 'original'
				},
				{
					name: 'resizeImage:25',
					value: '25',
					icon: 'small'
				},
				{
					name: 'resizeImage:50',
					value: '50',
					icon: 'medium'
				}
			],
			resizeUnit: '%'
		},
		cloudServices: CS_CONFIG,
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editorInsertImageViaUrl = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
