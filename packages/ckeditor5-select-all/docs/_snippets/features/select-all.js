/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'underline',
				'link',
				'insertTable',
				'|',
				'undo',
				'redo',
				'|',
				'selectAll'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Select all' ),
			text: 'Click to select everything.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
