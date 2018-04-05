/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DecoupledEditor from '../../build/ckeditor';

DecoupledEditor.create( document.querySelector( '#editor' ) )
	.then( editor => {
		document.querySelector( '.toolbar-container' ).appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
