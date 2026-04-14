/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig,
	setViewportTopOffsetDynamically
} from '@snippets/index.js';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#snippet-classic-editor-short' ),
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
