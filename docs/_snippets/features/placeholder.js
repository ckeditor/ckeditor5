/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-placeholder' ), {
		cloudServices: CS_CONFIG,
		toolbar: [
			'undo', 'redo', '|', 'heading',
			'|', 'bold', 'italic',
			'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
		],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		placeholder: 'Type the content here!'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
