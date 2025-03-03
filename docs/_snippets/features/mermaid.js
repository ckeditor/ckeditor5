/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import { CKBox, PictureEditing, ImageResize, AutoImage, LinkImage } from 'ckeditor5';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import { Mermaid } from '@ckeditor/ckeditor5-mermaid/dist/index.js';
import '@ckeditor/ckeditor5-mermaid/dist/index.css';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor
	.create( document.querySelector( '#mermaid' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			PictureEditing,
			ImageResize,
			AutoImage,
			LinkImage,
			CKBox,
			Mermaid
		] ),
		removePlugins: [ 'UploadImage' ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'mermaid',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
