/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { ListProperties } from '@ckeditor/ckeditor5-list';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Indent } from '@ckeditor/ckeditor5-indent';

import { GeneralHtmlSupport } from '../../src/generalhtmlsupport.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			ListProperties,
			Essentials,
			Italic,
			Paragraph,
			Strikethrough,
			Indent,
			SourceEditing,
			GeneralHtmlSupport
		],
		toolbar: [
			'sourceEditing', '|',
			'numberedList', 'bulletedList', '|',
			'outdent', 'indent', '|',
			'bold', 'italic', 'strikethrough'
		],
		list: {
			properties: {
				styles: true,
				startIndex: true,
				reversed: true
			}
		},
		htmlSupport: {
			allow: [
				{
					name: /^.*$/,
					styles: true,
					attributes: true,
					classes: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

document.getElementById( 'chbx-show-borders' ).addEventListener( 'change', () => {
	document.body.classList.toggle( 'show-borders' );
} );
