/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ImageResize,
	ImageInsert,
	AutoImage,
	PictureEditing,
	CKBox,
	CKBoxImageEdit,
	LinkImage,
	HorizontalLine,
	Alignment
} from 'ckeditor5';
import { ClassicEditor, ArticlePluginSet } from '@snippets/index.js';

export class ImageEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		ImageResize,
		ImageInsert,
		LinkImage,
		AutoImage,
		PictureEditing,
		CKBox,
		CKBoxImageEdit,
		ArticlePluginSet,
		HorizontalLine,
		Alignment
	];
}
