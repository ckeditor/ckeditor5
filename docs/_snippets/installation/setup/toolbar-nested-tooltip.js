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
	.create( document.querySelector( '#toolbar-nested-tooltip' ), {
		toolbar: [
			'undo', 'redo', '|',
			{
				label: 'Formatting',
				tooltip: 'Basic formatting features',
				items: [ 'bold', 'italic', 'strikethrough', 'superscript', 'subscript' ]
			},
			'|',
			{
				label: 'Inserting',
				icon: 'plus',
				tooltip: 'Insert media',
				items: [ 'insertImage', 'insertTable' ]
			}
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
