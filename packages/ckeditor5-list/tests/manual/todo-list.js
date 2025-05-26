/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';

import LegacyList from '../../src/legacylist.js';
import LegacyTodoList from '../../src/legacytodolist.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Enter, Typing, Heading, Highlight, Table, Bold, Paragraph, Undo,
			LegacyList, LegacyTodoList, Clipboard, Link, FontSize, ShiftEnter
		],
		toolbar: [
			'heading',
			'|',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'bold', 'link', 'highlight', 'insertTable', 'fontSize',
			'|',
			'undo', 'redo'
		],
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const contentPreviewBox = document.getElementById( 'preview' );

		contentPreviewBox.innerHTML = editor.getData();

		editor.model.document.on( 'change:data', () => {
			contentPreviewBox.innerHTML = editor.getData();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
