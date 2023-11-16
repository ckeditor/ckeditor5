/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import { formatHtml } from '@ckeditor/ckeditor5-source-editing/src/utils/formathtml';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, GeneralHtmlSupport, SourceEditing ],
		toolbar: [
			'heading',
			'|',
			'insertTable',
			'|',
			'bold',
			'italic',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'undo',
			'redo',
			'sourceEditing'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		htmlSupport: {
			allow: [
				{
					name: /^(table|tbody|thead|tr|td|th|caption)$/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const element = document.getElementById( 'editor-data' );
		element.innerText = formatHtml( editor.getData() );

		editor.model.document.on( 'change:data', () => {
			element.innerText = formatHtml( editor.getData() );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
