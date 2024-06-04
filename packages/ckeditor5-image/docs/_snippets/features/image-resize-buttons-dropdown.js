/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-resize-buttons-dropdown' ), {
		removePlugins: [ 'LinkImage', 'AutoImage' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
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
			resizeUnit: '%',
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:custom',
					label: 'Custom',
					value: 'custom'
				},
				{
					name: 'resizeImage:40',
					label: '40%',
					value: '40'
				},
				{
					name: 'resizeImage:60',
					label: '60%',
					value: '60'
				}
			],
			toolbar: [ 'resizeImage', '|', 'ckboxImageEdit' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorResizeUIDropdown = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
