/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import { formatHtml } from 'ckeditor5/src/utils.js';
import Table from '../../src/table.js';
import TableToolbar from '../../src/tabletoolbar.js';
import TableSelection from '../../src/tableselection.js';
import TableClipboard from '../../src/tableclipboard.js';
import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';
import TableCaption from '../../src/tablecaption.js';
import PlainTableOutput from '../../src/plaintableoutput.js';

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
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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
		const editorPreview = document.getElementById( 'editor-output-preview' );

		updateOutput();

		editor.model.document.on( 'change:data', () => {
			updateOutput();
		} );

		function updateOutput() {
			element.innerText = formatHtml( editor.getData() );
			editorPreview.innerHTML = editor.getData();
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
