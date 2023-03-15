/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( Base64UploadAdapter );

ClassicEditor
	.create( document.querySelector( '#snippet-image-base64-upload' ), {
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem(
				editor.ui.view.toolbar, item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Insert image'
			),
			text: 'Click to insert an image.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// The "Log editor data" button logic.
document.querySelector( '#log-data' ).addEventListener( 'click', () => {
	console.log( window.editor.getData() );
} );
