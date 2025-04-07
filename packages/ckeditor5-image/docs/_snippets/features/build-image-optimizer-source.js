/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CKBox,
	CKBoxImageEdit,
	ImageResize,
	ImageInsert,
	AutoImage,
	PictureEditing,
	LinkImage,
	HorizontalLine,
	Alignment
} from 'ckeditor5';
import { Uploadcare, UploadcareImageEdit } from 'ckeditor5-premium-features';
import { ClassicEditor } from '@snippets/index.js';

export class ImageOptimizerEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		ImageResize,
		ImageInsert,
		LinkImage,
		AutoImage,
		PictureEditing,
		HorizontalLine,
		Alignment,
		CKBox,
		CKBoxImageEdit,
		Uploadcare,
		UploadcareImageEdit
	];
}
