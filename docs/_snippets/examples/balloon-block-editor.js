/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

BalloonEditor
	.create( document.querySelector( '#snippet-balloon-block-editor' ), {
		cloudServices: CS_CONFIG,
		blockToolbar: [
			'undo', 'redo',
			'|', 'heading',
			'|', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		],
		toolbar: [ 'bold', 'italic', 'link' ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
