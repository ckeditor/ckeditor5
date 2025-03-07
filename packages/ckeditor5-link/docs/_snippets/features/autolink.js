/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { AutoLink } from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

ClassicEditor
	.create( document.querySelector( '#snippet-autolink' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [
			AutoLink
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
