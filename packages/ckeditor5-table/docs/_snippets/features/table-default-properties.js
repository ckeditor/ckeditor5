/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-table-default-properties' ), {
		extraPlugins: [
			CKEditorPlugins.TableProperties,
			CKEditorPlugins.TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				defaultProperties: {
					borderStyle: 'dashed',
					borderColor: 'hsl(90, 75%, 60%)',
					borderWidth: '3px',
					alignment: 'left',
					width: '550px',
					height: '450px'
				}
			},
			tableCellProperties: {
				defaultProperties: {
					horizontalAlignment: 'center',
					verticalAlignment: 'bottom',
					padding: '10px'
				}
			}
		},
		image: {
			toolbar: [
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		placeholder: 'Insert the new table with the default styles applied.'
	} )
	.then( editor => {
		window.editorDefaultStyles = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
