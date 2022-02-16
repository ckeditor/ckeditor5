/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Style from '../../src/style';

ClassicEditor
	.create( document.querySelector( '#editor-full' ), {
		plugins: [ ArticlePluginSet, Style ],
		toolbar: [
			'styleDropdown',
			'|',
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		style: {
			definitions: [
				{
					name: 'Red heading',
					element: 'h2',
					classes: [ 'red-heading' ]
				},
				{
					name: 'Large heading',
					element: 'h2',
					classes: [ 'large-heading' ]
				},
				{
					name: 'Rounded container',
					element: 'p',
					classes: [ 'rounded-container' ]
				},
				{
					name: 'Large preview',
					element: 'p',
					classes: [ 'large-preview' ]
				},
				{
					name: 'Colorfull cell',
					element: 'td',
					classes: [ 'colorful-cell' ]
				},
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Typewriter',
					element: 'span',
					classes: [ 'typewriter' ]
				},
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ]
				},
				{
					name: 'Cited work',
					element: 'span',
					classes: [ 'cited', 'another-class' ]
				},
				{
					name: 'Small text',
					element: 'span',
					classes: [ 'small' ]
				},
				{
					name: 'Very long name of the style',
					element: 'span',
					classes: [ 'foo' ]
				},

				{
					name: 'Foo',
					element: 'span',
					classes: [ 'Foo' ]
				},
				{
					name: 'Bar',
					element: 'span',
					classes: [ 'Bar' ]
				},
				{
					name: 'Baz',
					element: 'span',
					classes: [ 'Baz' ]
				},
				{
					name: 'Qux',
					element: 'span',
					classes: [ 'Qux' ]
				}
			]
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-just-inline' ), {
		plugins: [ ArticlePluginSet, Style ],
		toolbar: [
			'styleDropdown',
			'|',
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		style: {
			definitions: [
				{
					name: 'Marker',
					element: 'span',
					classes: [ 'marker' ]
				},
				{
					name: 'Typewriter',
					element: 'span',
					classes: [ 'typewriter' ]
				},
				{
					name: 'Deleted text',
					element: 'span',
					classes: [ 'deleted' ]
				}
			]
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editorInline = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
