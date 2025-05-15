/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	FindAndReplace,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage
} from 'ckeditor5';
import { ExportPdf, ExportWord } from 'ckeditor5-premium-features';
import { ClassicEditor } from '@snippets/index.js';

export class ReadOnlyEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		FindAndReplace,
		CKBox,
		CKBoxImageEdit,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		ExportPdf,
		ExportWord
	];
}
