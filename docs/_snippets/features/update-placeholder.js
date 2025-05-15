/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { PlaceholderEditor } from './placeholder-build.js';

PlaceholderEditor
	.create( document.querySelector( '#snippet-update-placeholder' ), {
		cloudServices: CS_CONFIG,
		toolbar: [
			'undo', 'redo', '|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		],
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		placeholder: 'Type some content here!'
	} )
	.then( editor => {
		const button = document.getElementById( 'update-placeholder-button' );
		window.editor = editor;

		button.addEventListener( 'click', () => {
			editor.editing.view.document.getRoot( 'main' ).placeholder = 'New placeholder';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
