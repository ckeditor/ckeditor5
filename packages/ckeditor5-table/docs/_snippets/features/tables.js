/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TableColumnResize,
	TableCaption,
	TableProperties,
	TableCellProperties
} from 'ckeditor5';
import {
	TOKEN_URL,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { TableEditor } from './build-table-source.js';

TableEditor
	.create( document.querySelector( '#snippet-tables' ), {
		extraPlugins: [
			TableColumnResize,
			TableCaption,
			TableProperties,
			TableCellProperties
		],
		table: {
			contentToolbar: [ 'toggleTableCaption', '|', 'tableColumn', 'tableRow', 'mergeTableCells', '|',
				'tableProperties', 'tableCellProperties' ]
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
		window.editor = editor;
		window.editorCaption = editor;

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.buttonView?.label === 'Insert table'
			),
			text: 'Click to create a table.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
