/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

ClassicEditor.builtinPlugins.push(
	SourceEditing, GeneralHtmlSupport, TableCellProperties, TableProperties, IndentBlock,
	CodeBlock, Underline, Strikethrough, Code, TodoList, Superscript, Subscript, Alignment,
	ImageCaption, LinkImage );

ClassicEditor.defaultConfig = {
	cloudServices: CS_CONFIG,
	toolbar: {
		items: [
			'sourceEditing',
			'|',
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'|',
			'undo',
			'redo'
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
