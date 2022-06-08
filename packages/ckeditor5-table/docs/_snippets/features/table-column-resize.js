/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-table-column-resize' ), {
		extraPlugins: [
			CKEditorPlugins.TableColumnResize, CKEditorPlugins.TableProperties, CKEditorPlugins.TableCaption, CKEditorPlugins.Superscript
		],
		table: {
			contentToolbar: [ 'toggleTableCaption', 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties' ]
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
		}
	} )
	.then( editor => {
		window.editorCaption = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
