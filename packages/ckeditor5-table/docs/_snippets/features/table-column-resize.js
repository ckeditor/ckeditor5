/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TableColumnResize,
	TableProperties,
	TableCaption,
	Superscript
} from 'ckeditor5';
import {
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { TableEditor } from './build-table-source.js';

TableEditor
	.create( document.querySelector( '#snippet-table-column-resize' ), {
		extraPlugins: [
			TableColumnResize,
			TableProperties,
			TableCaption,
			Superscript
		],
		table: {
			contentToolbar: [ 'toggleTableCaption', 'tableRow', 'mergeTableCells', 'tableProperties' ]
		},
		image: {
			toolbar: [
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
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
		window.editorCaption = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
