/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { FontSize, FontFamily, FontColor } from '@ckeditor/ckeditor5-font';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { List, ListProperties, TodoList } from '@ckeditor/ckeditor5-list';

import { Style } from '../src/style.js';

declare global {
	interface Window { editor: any }
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [
			Essentials, Bold, Italic, FontSize, FontFamily, FontColor, Heading, Paragraph,
			GeneralHtmlSupport, Style, SourceEditing, List, ListProperties, TodoList
		],
		toolbar: [
			'sourceEditing', '|',
			'heading', 'style', '|',
			'bold', 'italic', 'fontSize', 'fontFamily', 'fontColor', '|',
			'bulletedList', 'numberedList', 'todoList', '|',
			'undo', 'redo'
		],
		list: {
			enableListItemMarkerFromBlock: true,
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
		style: {
			definitions: [
				{ name: 'Lead paragraph', element: 'p', classes: [ 'lead' ] },
				{ name: 'Fancy heading', element: 'h2', classes: [ 'fancy-heading' ] }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
