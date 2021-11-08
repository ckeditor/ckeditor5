/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-table-styling' ), {
		extraPlugins: [
			CKEditorPlugins.TableProperties,
			CKEditorPlugins.TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editorStyling = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
