/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ToolbarEditor } from './build-toolbar-source.js';

ToolbarEditor
	.create( document.querySelector( '#toolbar-grouping' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
				'|', 'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
				'|', 'link', 'insertImage', 'blockQuote', 'codeBlock',
				'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText',
				'|', 'toggleImageCaption', 'imageTextAlternative', '|', 'ckboxImageEdit' ]
		},
		codeBlock: {
			languages: [
				{ language: 'css', label: 'CSS' },
				{ language: 'html', label: 'HTML' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'php', label: 'PHP' }
			]
		},
		fontFamily: {
			supportAllValues: true
		},
		fontSize: {
			options: [ 9, 10, 11, 12, 'default', 14, 15 ],
			supportAllValues: true
		},
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
				{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
				{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' }
			]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
