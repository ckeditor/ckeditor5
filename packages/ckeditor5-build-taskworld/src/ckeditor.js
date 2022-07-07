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
import HorizontalLine from '../../ckeditor5-horizontal-line/src/horizontalline';
import Italic from '../../ckeditor5-basic-styles/src/italic';
import Indent from '../../ckeditor5-indent/src/indent';
import Link from '../../ckeditor5-link/src/link';
import List from '../../ckeditor5-list/src/list';
import Paragraph from '../../ckeditor5-paragraph/src/paragraph';
import RemoveFormat from '../../ckeditor5-remove-format/src/removeformat';
import Strikethrough from '../../ckeditor5-basic-styles/src/strikethrough';
import Markdown from '../../ckeditor5-markdown-gfm/src/markdown';
import MarkdownGuide from '../../ckeditor5-markdown-guide/src/markdownguide';
import Mention from '../../ckeditor5-mention/src/mention';
import Underline from '../../ckeditor5-basic-styles/src/underline';

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
	HorizontalLine,
	Italic,
	Indent,
	Link,
	List,
	Markdown,
	MarkdownGuide,
	Mention,
	Paragraph,
	RemoveFormat,
	Strikethrough,
	Underline
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
			'link'
		]
	}
};
