/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-mention-custom-colors' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
