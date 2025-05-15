/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CKFinder,
	CKFinderUploadAdapter,
	PictureEditing,
	AutoImage,
	ImageResize,
	ImageInsert,
	LinkImage,
	Alignment
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

export class CKFinderEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		CKFinder,
		CKFinderUploadAdapter,
		PictureEditing,
		AutoImage,
		ImageResize,
		ImageInsert,
		LinkImage,
		Alignment
	];
}
