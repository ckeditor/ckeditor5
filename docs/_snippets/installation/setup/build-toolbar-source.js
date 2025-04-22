/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Code,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
	CKBox,
	CKBoxImageEdit,
	TodoList,
	Alignment,
	TableProperties,
	TableCellProperties,
	FontBackgroundColor,
	FontSize,
	FontColor,
	FontFamily,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	CodeBlock,
	Indent,
	IndentBlock,
	BlockToolbar,
	HeadingButtonsUI,
	ParagraphButtonUI,
	LinkImage
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

export class ToolbarEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		Code,
		Strikethrough,
		Subscript,
		Superscript,
		Underline,
		CKBox,
		CKBoxImageEdit,
		TodoList,
		Alignment,
		TableProperties,
		TableCellProperties,
		FontBackgroundColor,
		FontSize,
		FontColor,
		FontFamily,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		CodeBlock,
		Indent,
		IndentBlock,
		BlockToolbar,
		HeadingButtonsUI,
		ParagraphButtonUI,
		LinkImage
	];
}
