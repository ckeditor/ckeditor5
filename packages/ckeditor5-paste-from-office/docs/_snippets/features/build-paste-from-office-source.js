/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Bookmark,
	Code,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	Indent,
	IndentBlock,
	PasteFromOffice,
	TableProperties,
	TableCellProperties,
	TableColumnResize,
	Alignment,
	Font,
	HorizontalLine
} from 'ckeditor5';
import { ClassicEditor } from '@snippets/index.js';

const defaultConfig = { ...ClassicEditor.defaultConfig };

defaultConfig.table.contentToolbar.push( 'tableProperties', 'tableCellProperties', 'tableColumnResize' );

export class PasteFromOfficeEditor extends ClassicEditor {
	static builtinPlugins = [
		...ClassicEditor.builtinPlugins,
		PasteFromOffice,
		Alignment,
		Bookmark,
		Code,
		Strikethrough,
		Subscript,
		Superscript,
		Underline,
		Font,
		HorizontalLine,
		Indent,
		IndentBlock,
		PictureEditing,
		ImageInsert,
		ImageResize,
		AutoImage,
		LinkImage,
		CKBox,
		CKBoxImageEdit,
		TableProperties,
		TableCellProperties,
		TableColumnResize
	];

	static defaultConfig = defaultConfig;
}
