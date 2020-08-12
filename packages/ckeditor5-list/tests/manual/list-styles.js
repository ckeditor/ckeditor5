/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TablePropertiesEditing from '@ckeditor/ckeditor5-table/src/tableproperties/tablepropertiesediting';
import TableCellPropertiesEditing from '@ckeditor/ckeditor5-table/src/tablecellproperties/tablecellpropertiesediting';
import List from '../../src/list';
import ListStyles from '../../src/liststyles';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import TodoList from '../../src/todolist';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Code,
			Heading,
			List,
			TodoList,
			Paragraph,
			ListStyles,
			Table,
			TablePropertiesEditing,
			TableCellPropertiesEditing,
			Indent,
			IndentBlock
		],
		toolbar: [
			'heading',
			'|',
			'bulletedList', 'numberedList', 'todoList',
			'|',
			'outdent',
			'indent',
			'|',
			'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;

		// TODO: Remove.
		for ( const button of [ ...document.querySelectorAll( '.list-styles-ui button' ) ] ) {
			button.addEventListener( 'click', () => {
				editor.execute( 'listStyles', { type: button.getAttribute( 'data-list' ) } );
			} );
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
