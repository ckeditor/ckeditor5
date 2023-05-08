/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

window.editors = {};

function createEditor( selector ) {
	ClassicEditor
		.create( document.querySelector( selector ), {
			plugins: [ ArticlePluginSet ],
			toolbar: [
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
			window.editors[ selector ] = editor;

			CKEditorInspector.attach( selector, editor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

createEditor( '#normal' );
createEditor( '#single-line' );
createEditor( '#dark-bg' );
createEditor( '#medium-bg' );
createEditor( '#narrow' );
createEditor( '#narrow-dark-bg' );
createEditor( '#padding-less' );
createEditor( '#overflow-parent' );
