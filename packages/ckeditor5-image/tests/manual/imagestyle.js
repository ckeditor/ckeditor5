/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor-semantic' ), {
		plugins: [
			ArticlePluginSet
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
		}
	} )
	.then( editor => {
		window.editorSemantic = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-formatting' ), {
		plugins: [
			ArticlePluginSet
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			styles: [ 'alignLeft', 'alignCenter', 'alignRight' ],
			toolbar: [ 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight' ]
		}
	} )
	.then( editor => {
		window.editorFormatting = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
