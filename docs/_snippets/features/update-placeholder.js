/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
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
				top: window.getViewportTopOffsetConfig()
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
