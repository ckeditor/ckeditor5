/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Code, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { ImageUpload, ImageInsert, PictureEditing, AutoImage } from '@ckeditor/ckeditor5-image';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [
			ArticlePluginSet, SourceEditing, CKBox, CKBoxImageEdit, ImageInsert, ImageUpload, PictureEditing, AutoImage,
			CloudServices, Markdown, Code, CodeBlock, TodoList, Strikethrough, HorizontalLine
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'sourceEditing', '|', 'heading',
				'|', 'bold', 'italic', 'strikethrough', 'code',
				'-', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'blockQuote', 'codeBlock', 'horizontalLine',
				'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
			],
			shouldNotGroupWhenFull: true
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		codeBlock: {
			languages: [
				{ language: 'css', label: 'CSS' },
				{ language: 'html', label: 'HTML' },
				{ language: 'javascript', label: 'JavaScript' },
				{ language: 'php', label: 'PHP' }
			]
		},
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		}
	} )
	.then( editor => {
		window.editor = editor;

		const outputElement = document.querySelector( '#snippet-markdown-output' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so hightlight.js doesn't catch it.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
