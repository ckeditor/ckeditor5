/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, console, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
// import { add as addTranslations } from '../../../src/translation-service';

// import '@ckeditor/ckeditor5-build-classic/build/translations/de.js';
// import '@ckeditor/ckeditor5-build-classic/build/translations/ar.js';

// addTranslations( 'de', window.CKEDITOR_TRANSLATIONS.de );

const toolbarConfig = [
	'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo'
];

ClassicEditor
	.create( document.querySelector( '#editor-language' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: toolbarConfig,

		language: 'de'
	} )
	.then( newEditor => {
		window.editorLanguage = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: toolbarConfig,

		language: 'ar'
	} )
	.then( newEditor => {
		window.editorLanguageRTL = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl-content' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: toolbarConfig,

		language: 'en',
		contentLanguage: 'ar'
	} )
	.then( newEditor => {
		window.editorLanguageRTLContent = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-language-rtl-ui' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: toolbarConfig,

		language: 'ar',
		contentLanguage: 'en'
	} )
	.then( newEditor => {
		window.editorLanguageRTLUI = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
