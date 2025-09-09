/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Strikethrough, Code } from '@ckeditor/ckeditor5-basic-styles';
import { TodoList } from '@ckeditor/ckeditor5-list';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Markdown } from '../../src/markdown.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Markdown, ArticlePluginSet, Code, CodeBlock, Strikethrough, TodoList, TableProperties, TableCellProperties ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'strikethrough',
			'underline',
			'link',
			'|',
			'code',
			'codeBlock',
			'|',
			'todoList',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'|',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const outputElement = document.querySelector( '#markdown-output' );

		editor.model.document.on( 'change', () => {
			outputElement.innerText = editor.getData();
		} );

		// Set the initial data with delay so hightlight.js doesn't catch them.
		setTimeout( () => {
			outputElement.innerText = editor.getData();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
