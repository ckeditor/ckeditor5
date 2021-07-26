/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'sourceEditing',
				'|',
				'heading',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'subscript',
				'superscript',
				'code',
				'-',
				'codeBlock',
				'blockQuote',
				'link',
				'uploadImage',
				'insertTable',
				'mediaEmbed',
				'|',
				'bulletedList',
				'numberedList',
				'todoList',
				'|',
				'outdent',
				'indent',
				'|',
				'undo',
				'redo'
			],
			shouldNotGroupWhenFull: true
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			]
		},
		image: {
			toolbar: [
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		},
		htmlSupport: {
			allow: [
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
