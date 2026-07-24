/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
declare global {
	interface Window {
		editorLanguage: any;
		editorLanguageRTL: any;
		editorLanguageRTLContent: any;
		editorLanguageRTLUI: any;
	}
}

const config = {
	plugins: [ ArticlePluginSet ],
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'toggleImageCaption', 'imageTextAlternative' ]
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
	.create( Object.assign( {}, config, {
		language: 'en',
		attachTo: document.querySelector( '#editor-language' ) as HTMLElement
	} ) )
	.then( newEditor => {
		window.editorLanguage = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( Object.assign( {}, config, {
		language: 'ar',
		attachTo: document.querySelector( '#editor-language-rtl' ) as HTMLElement
	} ) )
	.then( newEditor => {
		window.editorLanguageRTL = newEditor;

		console.log( 'Editor created, locale:', newEditor.locale );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( Object.assign( {}, config, {
		attachTo: document.querySelector( '#editor-language-rtl-content' ) as HTMLElement,
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
	.create( Object.assign( {}, config, {
		attachTo: document.querySelector( '#editor-language-rtl-ui' ) as HTMLElement,
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
