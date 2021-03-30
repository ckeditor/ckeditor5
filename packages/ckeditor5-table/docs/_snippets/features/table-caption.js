/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-table-caption' ), {
		extraPlugins: [
			CKEditorPlugins.TableCaption
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'toggleTableCaption' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Toggle caption off' ),
			text: 'Click to hide table caption.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
