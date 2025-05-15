/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Strikethrough, Code, Underline, TodoList, CodeBlock, HorizontalLine, CKBox, CKBoxImageEdit,
	PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage
} from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig
} from '@snippets/index.js';

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
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
