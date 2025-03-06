/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { MentionEditor } from './build-mention-source.js';

MentionEditor
	.create( document.querySelector( '#snippet-mention-custom-colors' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
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
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marry Ann', '@Marshall', '@Robin', '@Ted' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
