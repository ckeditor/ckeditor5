/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { ImageUpload } from '@ckeditor/ckeditor5-image';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TodoList } from '@ckeditor/ckeditor5-list';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { HtmlComment } from '../../src/htmlcomment.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			CloudServices,
			EasyImage,
			ImageUpload,
			PasteFromOffice,
			SourceEditing,
			Table,
			TableToolbar,
			TodoList,
			HtmlComment
		],
		cloudServices: CS_CONFIG,
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'todoList', '|',
			'blockQuote', 'uploadImage', 'insertTable', '|',
			'sourceEditing', '|',
			'undo', 'redo'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );
