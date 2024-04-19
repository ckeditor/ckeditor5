/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#toolbar-nested-simple' ), {
		toolbar: [
			'undo', 'redo', '|',
			'heading', '|',
			{
				label: 'Fonts',
				icon: 'text',
				items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
			},
			'|', 'bold', 'italic', 'underline',
			{
				label: 'More basic styles',
				icon: 'threeVerticalDots',
				items: [ 'strikethrough', 'superscript', 'subscript' ]
			},
			'|', 'alignment', '|',
			{
				label: 'Lists',
				withText: true,
				icon: false,
				items: [ 'bulletedList', 'numberedList', 'todoList' ]
			},
			'|',
			'insertImage', 'insertTable'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText',
				'|', 'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit' ]
		},
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
