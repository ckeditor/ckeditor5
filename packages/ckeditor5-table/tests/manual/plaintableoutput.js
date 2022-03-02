/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import { formatHtml } from '@ckeditor/ckeditor5-source-editing/src/utils/formathtml';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import Table from '../../src/table';
import TableToolbar from '../../src/tabletoolbar';
import TableSelection from '../../src/tableselection';
import TableClipboard from '../../src/tableclipboard';
import TableProperties from '../../src/tableproperties';
import TableCellProperties from '../../src/tablecellproperties';
import TableCaption from '../../src/tablecaption';
import PlainTableOutput from '../../src/plaintableoutput';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			Table,
			TableToolbar,
			TableSelection,
			TableClipboard,
			TableProperties,
			TableCellProperties,
			TableCaption,
			PlainTableOutput,
			GeneralHtmlSupport,
			SourceEditing
		],
		toolbar: [
			'heading',
			'|',
			'insertTable',
			'|',
			'bold',
			'italic',
			'link',
			'|',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'|',
			'undo',
			'redo',
			'sourceEditing'
		],
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties',
				'toggleTableCaption'
			]
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
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
