/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Code, Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TablePropertiesEditing, TableCellPropertiesEditing } from '@ckeditor/ckeditor5-table';
import { LegacyList } from '../../src/legacylist.js';
import { LegacyListProperties } from '../../src/legacylistproperties.js';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { LegacyTodoList } from '../../src/legacytodolist.js';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';

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
