/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals DecoupledEditor, MiniCKEditorInspector, console, window, document */

DecoupledEditor
	.create( document.querySelector( '#mini-inspector-paragraph' ) )
	.then( editor => {
		window.editor = editor;

		MiniCKEditorInspector.attach(
			editor,
			document.querySelector( '#mini-inspector-paragraph-container' )
		);
	} )
	.catch( err => {
		console.error( err.stack );
	} );
