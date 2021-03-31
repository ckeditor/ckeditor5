/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-default-properties' ), {
		extraPlugins: [
			CKEditorPlugins.TableProperties,
			CKEditorPlugins.TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				defaultProperties: {
					borderStyle: 'dashed',
					borderColor: 'hsl(0, 0%, 60%)',
					borderWidth: '3px',
					alignment: 'left'
				}
			},
			tableCellProperties: {
				defaultProperties: {
					borderStyle: 'dotted',
					borderColor: 'hsl(120, 75%, 60%)',
					borderWidth: '2px',
					horizontalAlignment: 'right',
					verticalAlignment: 'bottom'
				}
			}
		},
		image: {
			toolbar: [
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		placeholder: 'Insert the new table with applied the default styles.'
	} )
	.then( editor => {
		window.editorDefaultStyles = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, 0 ),
			text: 'Click to insert the new table.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
