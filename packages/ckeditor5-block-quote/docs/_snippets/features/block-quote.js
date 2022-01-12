/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, window, document, console */

ClassicEditor
	.create( document.querySelector( '#snippet-block-quote' ) )
	.then( editor => {
		window.editor = editor;
		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Block quote' ),
			text: 'Click to insert a block quote.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
