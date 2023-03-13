/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'exportPdf', 'exportWord', 'findAndReplace',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
		let isReadOnly = false;

		button.addEventListener( 'click', () => {
			isReadOnly = !isReadOnly;

			if ( isReadOnly ) {
				editor.enableReadOnlyMode( 'docs-snippet' );
			} else {
				editor.disableReadOnlyMode( 'docs-snippet' );
			}

			button.textContent = isReadOnly ?
				'Turn off read-only mode' :
				'Turn on read-only mode';

			editor.editing.view.focus();
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
