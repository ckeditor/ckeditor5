/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { TableProperties, TableCellProperties, TableCaption, TableColumnResize } from '@ckeditor/ckeditor5-table';
import { FontSize, FontFamily } from '@ckeditor/ckeditor5-font';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( FontFamily, FontSize, Alignment, IndentBlock );
ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo',
			'|', 'heading', '|', 'fontFamily', 'fontSize',
			'|', 'bold', 'italic',
			'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|', 'aligmnet',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	},
	indentBlock: { offset: 30, unit: 'px' }
};

window.ClassicEditor = ClassicEditor;
window.CKEditorPlugins = {
	TableProperties,
	TableCellProperties,
	TableCaption,
	TableColumnResize,
	Superscript
};
