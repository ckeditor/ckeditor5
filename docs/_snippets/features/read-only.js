/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import ExportPdf from '@ckeditor/ckeditor5-export-pdf/src/exportpdf';
import ExportWord from '@ckeditor/ckeditor5-export-word/src/exportword';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		extraPlugins: [
			FindAndReplace,
			ExportPdf,
			ExportWord
		],
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'exportPdf',
				'exportWord',
				'|',
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'numberedList',
				'bulletedList',
				'|',
				'outdent',
				'indent',
				'|',
				'uploadImage',
				'blockQuote',
				'insertTable',
				'findAndReplace',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		exportPdf: {
			stylesheets: [
				'EDITOR_STYLES'
			],
			fileName: 'export-pdf-demo.pdf',
			appID: 'cke5-docs',
			converterOptions: {
				format: 'A4',
				margin_top: '20mm',
				margin_bottom: '20mm',
				margin_right: '12mm',
				margin_left: '12mm',
				page_orientation: 'portrait'
			},
			tokenUrl: false
		},
		exportWord: {
			fileName: 'export-word-demo.docx',
			tokenUrl: false
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#snippet-read-only-toggle' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;

			button.innerText = editor.isReadOnly ? 'Switch to editable mode' : 'Switch to read-only mode';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
