/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#toolbar-nested-simple' ), {
		toolbar: [
			{
				label: 'Basic styles',
				icon: 'bold',
				items: [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript' ]
			},
			'|',
			{
				label: 'Fonts',
				icon: 'text',
				items: [ 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor' ]
			},
			'|',
			{
				label: 'Code',
				icon: 'threeVerticalDots',
				items: [ 'code', 'codeBlock' ]
			},
			'|',
			{
				label: 'Lists',
				withText: true,
				icon: false,
				items: [ 'bulletedList', 'numberedList', 'todoList' ]
			},
			'alignment',
			'|',
			'undo', 'redo'
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
