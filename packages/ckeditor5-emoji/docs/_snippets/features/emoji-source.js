/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Emoji,
	Mention,
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

export class EmojiEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		Mention,
		Emoji,
		Font,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		LinkImage,
		CKBox,
		CKBoxImageEdit
	];
}
