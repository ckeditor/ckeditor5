/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import {
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#snippet-inspect-button' ).addEventListener( 'click', () => {
			CKEditorInspector.attach( editor );
		} );
	} )
	.catch( err => {
		console.error( err );
	} );

