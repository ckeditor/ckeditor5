/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env commonjs */
/* globals window, document, console */

const MultiRootEditor = require( '../../build/ckeditor' );

MultiRootEditor.create( {
	header: document.getElementById( 'header' ),
	content: document.getElementById( 'content' ),
	leftSide: document.getElementById( 'left-side' ),
	rightSide: document.getElementById( 'right-side' )
} )
	.then( editor => {
		window.editor = editor;

		document.getElementById( 'toolbar' ).appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
