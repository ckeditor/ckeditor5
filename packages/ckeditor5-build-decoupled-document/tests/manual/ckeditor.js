/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import DecoupledEditor from '../../build/ckeditor.js';

DecoupledEditor.create( document.querySelector( '#editor' ) )
	.then( editor => {
		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
