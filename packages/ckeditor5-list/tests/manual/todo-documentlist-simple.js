/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { FontSize } from '@ckeditor/ckeditor5-font';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Image, ImageResize, ImageInsert } from '@ckeditor/ckeditor5-image';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import List from '../../src/list.js';
import TodoList from '../../src/todolist.js';

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
			List,
			TodoList,
			SourceEditing,
			GeneralHtmlSupport,
			Alignment,
			Image,
			CloudServices,
			EasyImage,
			ImageResize,
			ImageInsert,
			LinkImage
		],
		toolbar: [
			'heading',
			'|',
			'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
			'|',
			'bold', 'link', 'fontSize', 'alignment',
			'|',
			'insertTable', 'insertImage',
			'|',
			'undo', 'redo', '|', 'sourceEditing'
		],
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		list: {
			multiBlock: false
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
