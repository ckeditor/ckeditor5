/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	CKBox,
	CKBoxImageEdit,
	CloudServices,
	ImageUpload,
	ImageInsert,
	PictureEditing
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ArticlePluginSet,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

ClassicEditor
	.create( document.querySelector( '#undo-redo' ), {
		plugins: [ ArticlePluginSet, PictureEditing, CKBox, ImageInsert, CKBoxImageEdit, ImageUpload, CloudServices ],
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
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
