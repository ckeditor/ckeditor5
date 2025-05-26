/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Autoformat from '../../src/autoformat.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Enter,
			Typing,
			Paragraph,
			Undo,
			Bold,
			Italic,
			Code,
			Strikethrough,
			Heading,
			List,
			TodoList,
			Autoformat,
			BlockQuote,
			CodeBlock,
			ShiftEnter,
			HorizontalLine
		],
		toolbar: [
			'heading',
			'|',
			'numberedList',
			'bulletedList',
			'todoList',
			'blockQuote',
			'codeBlock',
			'horizontalLine',
			'bold',
			'italic',
			'code',
			'strikethrough',
			'undo',
			'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
