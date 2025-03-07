/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Base64UploadAdapter } from 'ckeditor5';
import {
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor.builtinPlugins.push( Base64UploadAdapter );

ClassicEditor
	.create( document.querySelector( '#snippet-image-base64-upload' ), {
		removePlugins: [
			'CKBox'
		],
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Upload image from computer'
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
