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
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { TableEditor } from './build-table-source.js';

const customColorPalette = [
	{
		color: 'hsl(4, 90%, 58%)',
		label: 'Red'
	},
	{
		color: 'hsl(340, 82%, 52%)',
		label: 'Pink'
	},
	{
		color: 'hsl(291, 64%, 42%)',
		label: 'Purple'
	},
	{
		color: 'hsl(262, 52%, 47%)',
		label: 'Deep Purple'
	},
	{
		color: 'hsl(231, 48%, 48%)',
		label: 'Indigo'
	},
	{
		color: 'hsl(207, 90%, 54%)',
		label: 'Blue'
	},
	{
		color: 'hsl(199, 98%, 48%)',
		label: 'Light Blue'
	},
	{
		color: 'hsl(187, 100%, 42%)',
		label: 'Cyan'
	},
	{
		color: 'hsl(174, 100%, 29%)',
		label: 'Teal'
	},
	{
		color: 'hsl(122, 39%, 49%)',
		label: 'Green'
	},
	{
		color: 'hsl(88, 50%, 53%)',
		label: 'Light Green'
	},
	{
		color: 'hsl(66, 70%, 54%)',
		label: 'Lime'
	},
	{
		color: 'hsl(49, 98%, 60%)',
		label: 'Yellow'
	},
	{
		color: 'hsl(45, 100%, 51%)',
		label: 'Amber'
	},
	{
		color: 'hsl(36, 100%, 50%)',
		label: 'Orange'
	},
	{
		color: 'hsl(14, 91%, 54%)',
		label: 'Deep Orange'
	},
	{
		color: 'hsl(15, 25%, 34%)',
		label: 'Brown'
	},
	{
		color: 'hsl(0, 0%, 62%)',
		label: 'Gray'
	},
	{
		color: 'hsl(200, 18%, 46%)',
		label: 'Blue Gray'
	},
	{
		color: 'hsl(200, 18%, 100%)',
		label: 'White'
	}
];

TableEditor
	.create( document.querySelector( '#snippet-table-styling-colors' ), {
		extraPlugins: [
			TableProperties,
			TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				borderColors: customColorPalette,
				backgroundColors: customColorPalette
			},
			tableCellProperties: {
				borderColors: customColorPalette,
				backgroundColors: customColorPalette
			}
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
		window.editorStyling = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
