/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

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
		label: 'Grey'
	},
	{
		color: 'hsl(200, 18%, 46%)',
		label: 'Blue Grey'
	},
	{
		color: 'hsl(200, 18%, 100%)',
		label: 'White'
	},
];

ClassicEditor
	.create( document.querySelector( '#snippet-table-styling-colors' ), {
		extraPlugins: [
			CKEditorPlugins.TableProperties,
			CKEditorPlugins.TableCellProperties,
		],
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'insertTable', '|', 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
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
		}
	} )
	.then( editor => {
		window.editorStyling = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
