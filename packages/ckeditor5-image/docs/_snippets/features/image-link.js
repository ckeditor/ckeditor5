/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-link' ), {
		removePlugins: [ 'AutoImage' ],
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			allowExternalImagesEditing: [ /^data:/, 'origin' ],
			forceDemoLabel: true
		},
		image: {
			toolbar: [
				'linkImage',
				'|',
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'ckboxImageEdit'
			]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorLinks = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
