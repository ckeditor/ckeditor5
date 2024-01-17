/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { ListProperties } from '@ckeditor/ckeditor5-list';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { TableProperties, TableCellProperties, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Font } from '@ckeditor/ckeditor5-font';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor.builtinPlugins.push(
	PasteFromOffice,
	Alignment,
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
