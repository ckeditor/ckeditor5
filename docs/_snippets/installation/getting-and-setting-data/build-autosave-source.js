/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Autosave,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageResize,
	AutoImage
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

export class AutosaveEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		Autosave,
		CKBox,
		CKBoxImageEdit,
		PictureEditing,
		ImageResize,
		AutoImage
	];
}

