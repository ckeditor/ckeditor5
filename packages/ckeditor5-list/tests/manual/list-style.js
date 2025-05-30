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

ClassicEditor
	.create( document.querySelector( '#editor' ), {
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
			'heading',
			'|',
			'bold',
			'italic',
			'|',
			'removeFormat',
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );
