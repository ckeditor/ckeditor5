/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			Essentials,
			Italic,
			Paragraph,
			GeneralHtmlSupport
		],
		toolbar: [
			'bold',
			'italic',
			'strikethrough'
		],
		htmlSupport: {
			allow: [
				{
					name: 'div'
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
