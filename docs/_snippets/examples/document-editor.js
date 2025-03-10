/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { TableColumnResize } from 'ckeditor5';
import {
	CS_CONFIG,
	DecoupledEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

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
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		document
			.querySelector( '.document-editor__toolbar' )
			?.appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
