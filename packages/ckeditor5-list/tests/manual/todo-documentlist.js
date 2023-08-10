/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { FontSize } from '@ckeditor/ckeditor5-font';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import DocumentList from '../../src/documentlist';
import Todo from '../../src/todo';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Autoformat,
			BlockQuote,
			Bold,
			Heading,
			Italic,
			Link,
			MediaEmbed,
			Paragraph,
			Table,
			TableToolbar,
			FontSize,
			Indent,
			DocumentList,
			Todo,
			SourceEditing,
			GeneralHtmlSupport,
			Alignment
		],
		toolbar: [
			'heading',
			'|',
			'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
			'|',
			'bold', 'link', 'insertTable', 'fontSize', 'alignment',
			'|',
			'undo', 'redo', '|', 'sourceEditing'
		],
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		htmlSupport: {
			allow: [ { name: /.*/, attributes: true, classes: true, styles: true } ]
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
