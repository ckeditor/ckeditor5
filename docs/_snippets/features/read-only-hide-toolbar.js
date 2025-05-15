/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ReadOnlyEditor } from './read-only-build.js';

ReadOnlyEditor
	.create( document.querySelector( '#snippet-read-only-toolbar' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'exportPdf', 'exportWord', 'findAndReplace',
				'|', 'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
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
