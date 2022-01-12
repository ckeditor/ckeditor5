/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Autoformat from '../../src/autoformat';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';

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
