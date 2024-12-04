/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals DecoupledEditor, MiniCKEditorInspector, console, window, document */

DecoupledEditor
	.create( document.querySelector( '#mini-inspector-basic-styles' ) )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-basic-styles-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
