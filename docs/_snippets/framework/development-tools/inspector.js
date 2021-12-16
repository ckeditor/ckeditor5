/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
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

