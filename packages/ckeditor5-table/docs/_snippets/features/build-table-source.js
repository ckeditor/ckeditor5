/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	IndentBlock,
	FontSize,
	FontFamily,
	FontColor,
	Alignment,
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
	ClassicEditor as ClassicEditorBase,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

export class TableEditor extends ClassicEditorBase {
	static builtinPlugins = [
		...ClassicEditorBase.builtinPlugins,
		FontFamily,
		FontSize,
		FontColor,
		Alignment,
		IndentBlock,
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
				'undo', 'redo',
				'|', 'heading', '|', 'fontFamily', 'fontSize', 'fontColor',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'alignment',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ckbox: {
			tokeUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		indentBlock: { offset: 30, unit: 'px' }
	};
}
