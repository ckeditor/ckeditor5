/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import DocumentListProperties from '@ckeditor/ckeditor5-list/src/documentlistproperties';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			DocumentListProperties,
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
