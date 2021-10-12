/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '../../ckeditor5-editor-classic/src/classiceditor';

import AutoLink from '../../ckeditor5-link/src/autolink';
import AutoFormat from '../../ckeditor5-autoformat/src/autoformat';
import Bold from '../../ckeditor5-basic-styles/src/bold';
import BlockQuote from '../../ckeditor5-block-quote/src/blockquote';
import Code from '../../ckeditor5-basic-styles/src/code';
import CodeBlock from '../../ckeditor5-code-block/src/codeblock';
import Essentials from '../../ckeditor5-essentials/src/essentials';
import Heading from '../../ckeditor5-heading/src/heading';
import Italic from '../../ckeditor5-basic-styles/src/italic';
import Indent from '../../ckeditor5-indent/src/indent';
import Link from '../../ckeditor5-link/src/link';
import List from '../../ckeditor5-list/src/list';
import Paragraph from '../../ckeditor5-paragraph/src/paragraph';
import Strikethrough from '../../ckeditor5-basic-styles/src/strikethrough';
import Table from '../../ckeditor5-table/src/table';
import TableToolbar from '../../ckeditor5-table/src/tabletoolbar';
import Markdown from '../../ckeditor5-markdown-gfm/src/markdown';
import Mention from '../../ckeditor5-mention/src/mention';

export default class ClassicEditor extends ClassicEditorBase { }

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	AutoFormat,
	AutoLink,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	Heading,
	Italic,
	Indent,
	Link,
	List,
	Markdown,
	Mention,
	Paragraph,
	Strikethrough,
	Table,
	TableToolbar
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'link',
			'|',
			'insertTable'
		]
	},
	table: {
		// See https://ckeditor.com/docs/ckeditor5/latest/features/table.html#configuring-styling-tools
		tableProperties: {
			defaultProperties: {
				alignment: 'left'
			}
		},
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
