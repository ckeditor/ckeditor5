/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Bold,
	Italic,
	Code,
	Strikethrough,
	Underline,
	Subscript,
	Superscript,
	RemoveFormat,
	Alignment,
	Font,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

export class RemoveFormatEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		Alignment,
		Font,
		Bold,
		Italic,
		Underline,
		Strikethrough,
		Subscript,
		Superscript,
		Code,
		RemoveFormat,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		LinkImage,
		CKBox,
		CKBoxImageEdit
	];
}
