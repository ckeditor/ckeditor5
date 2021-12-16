/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-highlight' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'heading',
				'|',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'highlight',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem(
				editor.ui.view.toolbar, item => item.buttonView && item.buttonView.tooltip && item.buttonView.tooltip === 'Highlight'
			),
			text: 'Click to add highlight.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
