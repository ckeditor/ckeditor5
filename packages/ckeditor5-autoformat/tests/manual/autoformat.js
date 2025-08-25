/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Autoformat } from '../../src/autoformat.js';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { List, TodoList } from '@ckeditor/ckeditor5-list';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Code, Strikethrough, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';

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
