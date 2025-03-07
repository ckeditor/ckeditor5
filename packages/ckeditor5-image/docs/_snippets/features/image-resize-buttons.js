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
	.create( document.querySelector( '#snippet-image-resize-buttons' ), {
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
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
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
					name: 'resizeImage:custom',
					label: 'Custom',
					value: 'custom',
					icon: 'custom'
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
				'resizeImage:original',
				'resizeImage:custom',
				'|',
				'ckboxImageEdit'
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
