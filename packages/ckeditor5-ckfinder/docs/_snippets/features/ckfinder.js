/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-ckfinder' ), {
		toolbar: {
			items: [
				'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', '|', 'ckfinder'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
			options: {
				height: 600,
				width: 800
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Insert image or file' ),
			text: 'Click to open the file manager.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
