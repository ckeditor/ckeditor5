/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

export class BlockQuoteEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		PictureEditing,
		ImageResize,
		ImageInsert,
		AutoImage,
		LinkImage,
		CKBox,
		CKBoxImageEdit
	];

	static defaultConfig = {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed',
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
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit' ]
		}
	};
}
