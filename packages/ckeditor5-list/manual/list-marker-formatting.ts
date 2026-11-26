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
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';

import { List, ListProperties, TodoList } from '../src/index.js';

declare global {
	interface Window { editor: any }
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [
			Essentials, Bold, Italic, FontSize, FontFamily, FontColor, Heading, Paragraph,
			SourceEditing, List, ListProperties, TodoList
		],
		toolbar: [
			'sourceEditing', '|',
			'heading', '|',
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
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
