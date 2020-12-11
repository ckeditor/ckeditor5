/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#toolbar-grouping' ), {
		plugins: [ 	Alignment, ArticlePluginSet, EasyImage, Code, CodeBlock, TodoList, FontSize,
			FontFamily, FontColor, FontBackgroundColor ],
		toolbar: {
			items: [
				'heading', '|',
				'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
				'bold', 'italic', 'link', '|',
				'bulletedList', 'numberedList', 'todoList', '|',
				'code', 'codeBlock', '|',
				'outdent', 'indent', '|',
				'imageUpload', 'blockQuote', '|',
				'undo', 'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
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

		const outputElement = document.querySelector( '#toolbar-grouping' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so highlight.js doesn't catch it.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
