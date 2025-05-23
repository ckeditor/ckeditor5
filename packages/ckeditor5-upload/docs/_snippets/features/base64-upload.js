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

		window.umberto.afterDomReady( () => {
			const { fakeDevtools } = document.getElementById( 'base64-upload-console' );
			const refreshDevTools = window.umberto.throttle( () => {
				// Real console
				console.info( window.editor.getData() );

				// The fake one
				fakeDevtools.clear();
				fakeDevtools.loggers.info( window.editor.getData() );
			}, 200 );

			editor.model.document.on( 'change:data', refreshDevTools );
			refreshDevTools();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
