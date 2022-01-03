/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-table-caption' ), {
		extraPlugins: [
			CKEditorPlugins.TableCaption, CKEditorPlugins.Superscript
		],
		table: {
			contentToolbar: [ 'toggleTableCaption', '|', 'tableColumn', 'tableRow', 'mergeTableCells' ]
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
