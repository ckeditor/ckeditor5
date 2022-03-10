/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
				'code',
				'codeBlock',
				'|',
				'outdent',
				'indent',
				'|',
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
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Insert code block'
			),
			text: 'Click to insert a code block.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
