/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

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
			}
		],
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
