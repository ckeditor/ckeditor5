/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document, setTimeout */

ClassicEditor
	.create( document.querySelector( '#snippet-paste-from-markdown' ), {
		extraPlugins: [
			window.CKEditorPlugins.DocumentList,
			window.CKEditorPlugins.TodoDocumentList,
			window.CKEditorPlugins.AdjacentListsSupport,
			window.CKEditorPlugins.PasteFromMarkdownExperimental
		]
	} )
	.then( editor => {
		window.editor = editor;

		const outputElement = document.querySelector( '#snippet-paste-from-markdown-output' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so hightlight.js doesn't catch it.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
