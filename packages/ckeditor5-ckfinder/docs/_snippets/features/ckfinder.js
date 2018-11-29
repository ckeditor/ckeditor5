/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-ckfinder' ), {
		toolbar: {
			items: [
				'ckfinder', '|', 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: 100
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
			options: {
				height: 600,
				width: 800
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
