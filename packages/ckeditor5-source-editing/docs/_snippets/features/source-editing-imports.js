/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window */

import {
	Code, Underline, Strikethrough, Subscript, Superscript, IndentBlock, TodoList, TableProperties,
	TableCellProperties, SourceEditing, Markdown, GeneralHtmlSupport, CodeBlock, Alignment, CKBox,
	CKBoxImageEdit, PictureEditing, ImageInsert, ImageResize, AutoImage, ImageCaption, LinkImage
} from 'ckeditor5';

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
	}
};

window.ClassicEditor = ClassicEditor;
window.Markdown = Markdown;
