/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#toolbar-wrapping' ), {
		toolbar: {
			items: [
				'heading', '|',
				'fontfamily', 'fontsize', '|',
				'alignment', '|',
				'fontColor', 'fontBackgroundColor', '|',
				'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
				'link', '|',
				'outdent', 'indent', '|',
				'bulletedList', 'numberedList', 'todoList', '|',
				'code', 'codeBlock', '|',
				'insertTable', '|',
				'uploadImage', 'blockQuote', '|',
				'undo', 'redo'
			],
			shouldNotGroupWhenFull: true
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
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
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
