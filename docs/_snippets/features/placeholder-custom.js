/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, ClassicEditor */

ClassicEditor
	.create( document.querySelector( '#snippet-placeholder-custom' ), {
		placeholder: 'Type the content here!'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
