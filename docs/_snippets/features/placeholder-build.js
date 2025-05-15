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
	AutoImage
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

export class PlaceholderEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		CKBox,
		CKBoxImageEdit,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage
	];
}
