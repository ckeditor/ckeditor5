/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

createEditor( '#editor-ltr', 'en', 'en' );
createEditor( '#editor-rtl-mixed', 'ar', 'en' );
createEditor( '#editor-rtl', 'ar', 'ar' );

function createEditor( selector, language, uiLanguageCode ) {
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'|',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'|',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			language: {
				ui: uiLanguageCode,
				content: language
			}
		} )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
