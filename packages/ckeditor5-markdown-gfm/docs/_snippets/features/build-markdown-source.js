/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import { Code, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { ImageUpload, PictureEditing } from '@ckeditor/ckeditor5-image';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { Markdown, PasteFromMarkdownExperimental } from '@ckeditor/ckeditor5-markdown-gfm';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( ArticlePluginSet, SourceEditing, CKBox, ImageUpload, PictureEditing, CloudServices, Markdown,
	Code, CodeBlock, TodoList, Strikethrough, HorizontalLine );

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'undo', 'redo', '|', 'sourceEditing', '|', 'heading',
			'|', 'bold', 'italic', 'strikethrough', 'code',
			'-', 'link', 'uploadImage', 'insertTable', 'mediaEmbed', 'blockQuote', 'codeBlock', 'horizontalLine',
			'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
		]
	},
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
	},
	codeBlock: {
		languages: [
			{ language: 'css', label: 'CSS' },
			{ language: 'html', label: 'HTML' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'php', label: 'PHP' }
		]
	},
	ui: {
		viewportOffset: {
			top: window.getViewportTopOffsetConfig()
		}
	}
};

window.ClassicEditor = ClassicEditor;
window.CKEditorPlugins = {
	ArticlePluginSet,
	SourceEditing,
	CKBox,
	ImageUpload,
	PictureEditing,
	CloudServices,
	Markdown,
	PasteFromMarkdownExperimental,
	Code,
	CodeBlock,
	TodoList,
	Strikethrough,
	HorizontalLine
};
