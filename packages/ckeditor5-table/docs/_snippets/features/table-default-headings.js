/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { TableEditor } from './build-table-source.js';

TableEditor
	.create( document.querySelector( '#snippet-table-default-headings' ), {
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			defaultHeadings: { rows: 1, columns: 1 }
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		}
	} )
	.then( editor => {
		window.editorDefaultHeadings = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
