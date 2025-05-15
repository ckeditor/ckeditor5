/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ImageEditor } from './build-image-source.js';

ImageEditor
	.create( document.querySelector( '#snippet-image-resize-px' ), {
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
		image: {
			resizeUnit: 'px',
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
					name: 'resizeImage:100',
					label: '100px',
					value: '100'
				},
				{
					name: 'resizeImage:200',
					label: '200px',
					value: '200'
				}
			],
			toolbar: [ 'resizeImage', 'ckboxImageEdit' ]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorResizePX = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
