/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { List } from '@ckeditor/ckeditor5-list';
import { Table } from '@ckeditor/ckeditor5-table';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { ShowWhitespace } from '../../src/index.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Heading,
			Paragraph,
			Bold,
			Italic,
			List,
			Table,
			BlockQuote,
			ShowWhitespace
		],
		toolbar: [
			'heading', '|',
			'bold', 'italic', '|',
			'bulletedList', 'numberedList', 'blockQuote', '|',
			'insertTable', '|',
			'showWhitespace', '|',
			'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#get-data' ).addEventListener( 'click', () => {
			console.log( editor.getData() );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
