/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import ClassicEditor from '../../build-classic';

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

