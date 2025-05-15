/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ToolbarEditor } from './build-toolbar-source.js';

ToolbarEditor
	.create( document.querySelector( '#toolbar-nested-simple' ), {
		toolbar: [
			'undo', 'redo', '|',
			'heading', '|',
			{
				label: 'Fonts',
				icon: 'text',
				items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
			},
			'|', 'bold', 'italic', 'underline',
			{
				label: 'More basic styles',
				icon: 'threeVerticalDots',
				items: [ 'strikethrough', 'superscript', 'subscript' ]
			},
			'|', 'alignment', '|',
			{
				label: 'Lists',
				withText: true,
				icon: false,
				items: [ 'bulletedList', 'numberedList', 'todoList' ]
			},
			'|',
			'insertImage', 'insertTable'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText',
				'|', 'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit' ]
		},
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
