/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Underline, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { ImageCaption } from '@ckeditor/ckeditor5-image';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push(
	SourceEditing,
	GeneralHtmlSupport,
	TableCellProperties,
	TableProperties,
	IndentBlock,
	CodeBlock,
	Underline,
	Strikethrough,
	Code,
	TodoList,
	Superscript,
	Subscript,
	Alignment,
	ImageCaption,
	LinkImage
);

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo',
			'|', 'sourceEditing',
			'|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	}
};

window.ClassicEditor = ClassicEditor;
window.Markdown = Markdown;
