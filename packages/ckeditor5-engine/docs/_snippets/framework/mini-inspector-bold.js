/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, console, window, document */

DecoupledEditor
	.create( document.querySelector( '#mini-inspector-bold' ) )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-bold-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
