/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import ExportPdf from '@ckeditor/ckeditor5-export-pdf/src/exportpdf';
import ExportWord from '@ckeditor/ckeditor5-export-word/src/exportword';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		plugins: [ FindAndReplace, ExportPdf, ExportWord ],
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
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
				'insertImage',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo',
				'|',
				'findAndReplace',
				'exportPdf',
				'exportWord'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
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
