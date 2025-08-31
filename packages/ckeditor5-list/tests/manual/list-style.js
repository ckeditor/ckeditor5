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
