/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ReadOnlyEditor } from './read-only-build.js';

ReadOnlyEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'exportPdf', 'exportWord', 'findAndReplace',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		exportPdf: {
			stylesheets: [
				'../assets/fonts.css',
				'../assets/ckeditor5/ckeditor5.css',
				'../assets/ckeditor5-premium-features/ckeditor5-premium-features.css',
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
