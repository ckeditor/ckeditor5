/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { ImageResize } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { ListProperties } from '@ckeditor/ckeditor5-list';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Font } from '@ckeditor/ckeditor5-font';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

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
	ImageResize,
	TableProperties,
	TableCellProperties
);

ClassicEditor.defaultConfig.table.contentToolbar.push( 'tableProperties', 'tableCellProperties' );

window.ClassicEditor = ClassicEditor;
window.ListProperties = ListProperties;
