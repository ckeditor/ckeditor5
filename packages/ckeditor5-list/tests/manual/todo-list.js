/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter, ShiftEnter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { Link } from '@ckeditor/ckeditor5-link';
import { Table } from '@ckeditor/ckeditor5-table';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { FontSize } from '@ckeditor/ckeditor5-font';

import { LegacyList } from '../../src/legacylist.js';
import { LegacyTodoList } from '../../src/legacytodolist.js';

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
