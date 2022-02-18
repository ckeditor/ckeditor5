/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TablePropertiesEditing from '@ckeditor/ckeditor5-table/src/tableproperties/tablepropertiesediting';
import TableCellPropertiesEditing from '@ckeditor/ckeditor5-table/src/tablecellproperties/tablecellpropertiesediting';
import List from '../../src/list';
import ListProperties from '../../src/listproperties';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import TodoList from '../../src/todolist';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

const config = {
	initialData: `
		<h3>Ordered list</h3>
		<ol>
			<li>First item</li>
			<li>Second item</li>
			<li>Third item</li>
		</ol>
		<h3>Unordered list</h3>
		<ul>
			<li>First item</li>
			<li>Second item</li>
			<li>Third item</li>
		</ul>
	`,
	plugins: [
		Essentials,
		Bold,
		Italic,
		Code,
		Heading,
		List,
		TodoList,
		Paragraph,
		ListProperties,
		Table,
		TablePropertiesEditing,
		TableCellPropertiesEditing,
		Indent,
		IndentBlock,
		RemoveFormat
	],
	toolbar: [
		'numberedList',
		'|',
		'bulletedList', 'todoList',
		'|',
		'heading',
		'|',
		'bold',
		'italic',
		'|',
		'removeFormat',
		'|',
		'outdent',
		'indent',
		'|',
		'undo', 'redo'
	]
};

ClassicEditor
	.create( document.querySelector( '#editor-a' ), {
		...config,
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-b' ), {
		...config,
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: false
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-c' ), {
		...config,
		list: {
			properties: {
				styles: true,
				startIndex: false,
				reversed: true
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// ------------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#editor-d' ), {
		...config,
		list: {
			properties: {
				styles: false,
				startIndex: true,
				reversed: true
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-e' ), {
		...config,
		list: {
			properties: {
				styles: false,
				startIndex: true,
				reversed: false
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-f' ), {
		...config,
		list: {
			properties: {
				styles: false,
				startIndex: false,
				reversed: true
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// ------------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#editor-g' ), {
		...config,
		list: {
			properties: {
				styles: true,
				startIndex: false,
				reversed: false
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// ------------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#editor-h' ), {
		...config,
		list: {
			properties: {
				styles: false,
				startIndex: false,
				reversed: false
			}
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
