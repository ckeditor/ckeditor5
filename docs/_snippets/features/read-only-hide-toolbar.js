/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only-toolbar' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#snippet-read-only-toggle-toolbar' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;

			button.innerText = editor.isReadOnly ? 'Switch to editable mode' : 'Switch to read-only mode';
		} );

		const toolbarElement = editor.ui.view.toolbar.element;

		editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
			if ( isReadOnly ) {
				toolbarElement.style.display = 'none';
			} else {
				toolbarElement.style.display = 'flex';
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
