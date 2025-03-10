/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Code,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	IndentBlock,
	TodoList,
	TableProperties,
	TableCellProperties,
	SourceEditing,
	GeneralHtmlSupport,
	CodeBlock,
	Alignment,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	ImageCaption,
	LinkImage
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

export class SourceEditingEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		SourceEditing,
		GeneralHtmlSupport,
		TableCellProperties,
		TableProperties,
		IndentBlock,
		CodeBlock,
		Underline,
		Strikethrough,
		Code,
		TodoList,
		Superscript,
		Subscript,
		Alignment,
		ImageCaption,
		LinkImage,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		CKBox,
		CKBoxImageEdit
	];

	static defaultConfig = {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'sourceEditing',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	};
}
