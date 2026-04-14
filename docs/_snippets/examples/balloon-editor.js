/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	BalloonEditor,
	getViewportTopOffsetConfig,
	setViewportTopOffsetDynamically
} from '@snippets/index.js';

BalloonEditor
	.create( {
		root: {
			element: document.querySelector( '#snippet-balloon-editor' )
		},
		cloudServices: CS_CONFIG,
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		setViewportTopOffsetDynamically( editor );
	} )
	.catch( err => {
		console.error( err );
	} );
