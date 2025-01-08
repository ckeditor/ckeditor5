/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import { TableColumnResize } from '@ckeditor/ckeditor5-table';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import DecoupledEditor from '../build-decoupled-document.js';

DecoupledEditor
	.create( document.querySelector( '.document-editor__editable' ), {
		extraPlugins: [
			TableColumnResize
		],
		cloudServices: CS_CONFIG,
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
		licenseKey: 'GPL'
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '.document-editor__toolbar' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
