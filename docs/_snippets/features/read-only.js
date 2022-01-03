/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
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
				'../assets/fonts.css',
				'EDITOR_STYLES',
				'../assets/read-only-export-pdf.css'
			],
			fileName: 'export-pdf-demo.pdf',
			appID: 'cke5-docs',
			converterOptions: {
				format: 'A4',
				margin_top: '15mm',
				margin_bottom: '15mm',
				margin_right: '15mm',
				margin_left: '15mm',
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
		const button = document.querySelector( '#snippet-read-only-toggle' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;

			button.innerText = editor.isReadOnly ? 'Switch to editable mode' : 'Switch to read-only mode';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Demo styles.
const link = document.createElement( 'link' );
link.rel = 'stylesheet';
link.href = '../assets/read-only-export-pdf.css';

document.head.appendChild( link );
