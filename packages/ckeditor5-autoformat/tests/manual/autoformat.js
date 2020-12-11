/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Autoformat from '../../src/autoformat';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import List from '@ckeditor/ckeditor5-list/src/list';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
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
			Essentials,	Widget,	Paragraph, Bold, Italic,
			Code, Strikethrough, Heading, List, Autoformat,
			BlockQuote, CodeBlock,
			ShiftEnter, HorizontalLine
		],
		toolbar: [
			'heading',
			'|',
			'numberedList', 'bulletedList', 'blockQuote', 'codeBlock', 'horizontalLine',
			'bold', 'italic', 'code', 'strikethrough',
			'|',
			'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
