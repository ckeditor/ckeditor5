/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only-toolbar' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'exportPdf', 'exportWord', 'findAndReplace',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#snippet-read-only-toggle-toolbar' );
		let isReadOnly = false;

		button.addEventListener( 'click', () => {
			isReadOnly = !isReadOnly;

			if ( isReadOnly ) {
				editor.enableReadOnlyMode( 'docs-snippet' );
			} else {
				editor.disableReadOnlyMode( 'docs-snippet' );
			}

			button.textContent = isReadOnly ?
				'Turn off read-only mode' :
				'Turn on read-only mode';

			editor.editing.view.focus();
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
