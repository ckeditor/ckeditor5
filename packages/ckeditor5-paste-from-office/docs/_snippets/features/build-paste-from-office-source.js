/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import {
	Bookmark, Code, Strikethrough, Subscript, Superscript, Underline, CKBox, CKBoxImageEdit,
	PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage, Indent, IndentBlock,
	ListProperties, PasteFromOffice, TableProperties, TableCellProperties, TableColumnResize,
	Alignment, Font, HorizontalLine
} from 'ckeditor5';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
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
);

ClassicEditor.defaultConfig.table.contentToolbar.push( 'tableProperties', 'tableCellProperties', 'tableColumnResize' );

window.ClassicEditor = ClassicEditor;
window.ListProperties = ListProperties;
