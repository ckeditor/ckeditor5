/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

ClassicEditor
	.create( document.querySelector( '#snippet-markdown' ), {
		plugins: [
			ArticlePluginSet, EasyImage, ImageUpload, CloudServices, Markdown,
			Code, CodeBlock, TodoList, Strikethrough, HorizontalLine
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'strikethrough',
			'link',
			'|',
			'bulletedList',
			'numberedList',
			'todoList',
			'|',
			'code',
			'codeBlock',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'horizontalLine',
			'|',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
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
