/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global CKEditorInspector, document, window */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Table } from '@ckeditor/ckeditor5-table';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Bold, Code, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Image } from '@ckeditor/ckeditor5-image';

import EmailIntegration from '../../src/emailintegration.js';

ClassicEditor
	.create( document.getElementById( 'editor' ), {
		plugins: [
			Table,
			Essentials,
			List,
			ListProperties,
			Bold,
			Italic,
			Code,
			Paragraph,
			Heading,
			SourceEditing,
			EmailIntegration,
			Image
		],
		toolbar: [
			'sourceEditing', '|', 'insertTable', 'bulletedList',
			'numberedList', 'bold', 'italic', 'heading'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ],
			tableProperties: {
				defaultProperties: {
					borderStyle: 'dashed',
					borderColor: 'hsl(0, 0%, 60%)',
					borderWidth: '3px',
					backgroundColor: '#00f',
					alignment: 'left',
					width: '300px',
					height: '250px'
				}
			},
			tableCellProperties: {
				defaultProperties: {
					borderStyle: 'dotted',
					borderColor: 'hsl(120, 75%, 60%)',
					borderWidth: '2px',
					horizontalAlignment: 'right',
					verticalAlignment: 'bottom',
					padding: '10px'
				}
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
		CKEditorInspector.attach( { Editor: editor } );
	} );
