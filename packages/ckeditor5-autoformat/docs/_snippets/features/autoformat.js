/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import { Strikethrough, Code, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

ClassicEditor
	.create( document.querySelector( '#snippet-autoformat' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [
			Code,
			CodeBlock,
			HorizontalLine,
			Strikethrough,
			Underline,
			TodoList,
			PictureEditing,
			ImageInsert,
			ImageResize,
			AutoImage,
			LinkImage,
			CKBox,
			CKBoxImageEdit
		] ),
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic', 'underline', 'strikethrough', 'code',
				'|', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'codeBlock', 'horizontalLine',
				'|', 'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		cloudServices: CS_CONFIG,
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
