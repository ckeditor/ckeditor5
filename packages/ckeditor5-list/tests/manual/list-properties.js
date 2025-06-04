/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TablePropertiesEditing from '@ckeditor/ckeditor5-table/src/tableproperties/tablepropertiesediting.js';
import TableCellPropertiesEditing from '@ckeditor/ckeditor5-table/src/tablecellproperties/tablecellpropertiesediting.js';
import LegacyList from '../../src/legacylist.js';
import LegacyListProperties from '../../src/legacylistproperties.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import LegacyTodoList from '../../src/legacytodolist.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

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
		LegacyList,
		LegacyTodoList,
		Paragraph,
		LegacyListProperties,
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
	.then( editor => {
		CKEditorInspector.attach( { 'Styles + Start index + Reversed': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Styles + Start index': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Styles + Reversed': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Start index + Reversed': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Start index': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Reversed': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'Just styles': editor } );
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
	.then( editor => {
		CKEditorInspector.attach( { 'No properties enabled': editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// ------------------------------------------------------------------

ClassicEditor
	.create( document.querySelector( '#editor-i' ), {
		...config,
		menuBar: {
			isVisible: true
		},
		list: {
			properties: {
				styles: {
					listStyleTypes: {
						numbered: [
							'decimal',
							'decimal-leading-zero',
							'lower-roman',
							'upper-roman'
						],
						bulleted: [
							'disc',
							'circle',
							'square'
						]
					}
				}
			}
		}
	} )
	.then( editor => {
		CKEditorInspector.attach( { 'No properties enabled': editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
