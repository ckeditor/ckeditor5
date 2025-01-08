/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import { Code, Underline, Strikethrough, Subscript, Superscript } from '@ckeditor/ckeditor5-basic-styles';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage, ImageCaption } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

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
	LinkImage,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	CKBox,
	CKBoxImageEdit
);

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo',
			'|', 'sourceEditing',
			'|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		]
	},
	ckbox: {
		tokenUrl: TOKEN_URL,
		allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
		forceDemoLabel: true
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	},
	licenseKey: 'GPL'
};

window.ClassicEditor = ClassicEditor;
window.Markdown = Markdown;
