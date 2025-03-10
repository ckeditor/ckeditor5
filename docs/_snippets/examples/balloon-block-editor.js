/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	BalloonBlockEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

BalloonBlockEditor
	.create( document.querySelector( '#snippet-balloon-block-editor' ), {
		removePlugins: [
			'CKBox'
		],
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
