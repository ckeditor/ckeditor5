/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, console, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

const config = {
	plugins: [ ArticlePluginSet ],
	image: {
		toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	toolbar: [
		'heading',
		'|',
		'bold', 'italic', 'link',
		'bulletedList', 'numberedList',
		'blockQuote', 'insertTable', 'mediaEmbed',
		'undo', 'redo'
	]
};

ClassicEditor
	.create( document.querySelector( '#editor-language' ), Object.assign( {}, config, {
		language: 'en'
	} ) )
	.then( newEditor => {
		window.editorLanguage = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl' ), Object.assign( {}, config, {
		language: 'ar'
	} ) )
	.then( newEditor => {
		window.editorLanguageRTL = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl-content' ), Object.assign( {}, config, {
		language: {
			content: 'ar'
		}
	} ) )
	.then( newEditor => {
		window.editorLanguageRTLContent = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl-ui' ), Object.assign( {}, config, {
		language: {
			ui: 'ar',
			content: 'en'
		}
	} ) )
	.then( newEditor => {
		window.editorLanguageRTLUI = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
