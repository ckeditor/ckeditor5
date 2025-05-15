/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
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

const COLOR_PALETTE = [
	{
		color: 'hsl(0, 0%, 0%)',
		label: 'Black'
	},
	{
		color: 'hsl(0, 0%, 30%)',
		label: 'Dim grey'
	},
	{
		color: 'hsl(0, 0%, 60%)',
		label: 'Grey'
	},
	{
		color: 'hsl(0, 0%, 90%)',
		label: 'Light grey'
	},
	{
		color: 'hsl(0, 0%, 100%)',
		label: 'White',
		hasBorder: true
	},
	{
		color: 'hsl(0, 100%, 89%)',
		label: 'Pink'
	},
	{
		color: 'hsl(0, 75%, 60%)',
		label: 'Red'
	},
	{
		color: 'hsl(60, 75%, 60%)',
		label: 'Yellow'
	},
	{
		color: 'hsl(27, 100%, 85%)',
		label: 'Light Orange'
	},
	{
		color: 'hsl(30, 75%, 60%)',
		label: 'Orange'
	},
	{
		color: 'hsl(90, 75%, 60%)',
		label: 'Light green'
	},
	{
		color: 'hsl(120, 75%, 60%)',
		label: 'Green'
	},
	{
		color: 'hsl(150, 75%, 60%)',
		label: 'Aquamarine'
	},
	{
		color: 'hsl(120, 100%, 25%)',
		label: 'Dark green'
	},
	{
		color: 'hsl(180, 75%, 60%)',
		label: 'Turquoise'
	},
	{
		color: 'hsl(180, 52%, 58%)',
		label: 'Light Aqua'
	},
	{
		color: 'hsl(180, 97%, 31%)',
		label: 'Aqua'
	},
	{
		color: 'hsl(210, 75%, 60%)',
		label: 'Light blue'
	},
	{
		color: 'hsl(240, 75%, 60%)',
		label: 'Blue'
	},
	{
		color: 'hsl(270, 75%, 60%)',
		label: 'Purple'
	}
];

TableEditor
	.create( document.querySelector( '#snippet-table-nesting' ), {
		extraPlugins: [
			TableProperties,
			TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				borderColors: COLOR_PALETTE,
				backgroundColors: COLOR_PALETTE
			},
			tableCellProperties: {
				borderColors: COLOR_PALETTE,
				backgroundColors: COLOR_PALETTE
			}
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
		window.editorStyling = editor;

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.buttonView?.label === 'Insert table'
			),
			text: 'Click to insert a nested table in a selected table cell.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
