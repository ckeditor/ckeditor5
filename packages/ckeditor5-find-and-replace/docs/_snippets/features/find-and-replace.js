/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-findandreplace' ), {
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
				'findAndReplace'
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
			target: window.findToolbarItem(
				editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.tooltip && item.buttonView.tooltip === 'Find and replace' ),
			text: 'Click to find and replace anything you need.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
