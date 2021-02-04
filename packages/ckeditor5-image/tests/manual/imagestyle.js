/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// ClassicEditor
// 	.create( document.querySelector( '#editor-semantic' ), {
// 		plugins: [
// 			ArticlePluginSet
// 		],
// 		toolbar: [
// 			'heading',
// 			'|',
// 			'bold',
// 			'italic',
// 			'link',
// 			'bulletedList',
// 			'numberedList',
// 			'blockQuote',
// 			'insertTable',
// 			'mediaEmbed',
// 			'undo',
// 			'redo'
// 		],
// 		image: {
// 			toolbar: [ 'imageStyle:blockFull', 'imageStyle:blockSide' ]
// 		}
// 	} )
// 	.then( editor => {
// 		window.editorSemantic = editor;
// 	} )
// 	.catch( err => {
// 		console.error( err.stack );
// 	} );

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
			styles: {
				arrangements: [
					'blockCenter',
					'blockSide',
					'inlineLeft',
					'inlineRight',
					'inline',
					'blockCenter',
					'blockLeft',
					'blockRight'
				],
				groups: [
					'inParagraph',
					'betweenParagraphs'
				]
			},
			toolbar: [
				'imageStyle:inline',
				'imageStyle:inParagraph:inlineLeft',
				'imageStyle:inParagraph:inlineRight',
				'imageStyle:betweenParagraphs:blockCenter',
				'imageStyle:betweenParagraphs:blockLeft',
				'imageStyle:betweenParagraphs:blockRight',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editorFormatting = editor;
		CKEditorInspector.attach( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
