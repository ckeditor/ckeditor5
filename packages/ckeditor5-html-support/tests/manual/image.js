/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			Heading,
			Essentials,
			GeneralHtmlSupport,
			Italic,
			Paragraph,
			SourceEditing,
			Strikethrough,
			Image
		],
		toolbar: [ 'image', '|', 'bold', 'italic', 'strikethrough', '|', 'sourceEditing' ],
		htmlSupport: {
			allow: [
				{
					name: /^(figure|img|caption|figcaption)$/,
					attributes: [ 'data-validation-allow', 'data-validation-disallow' ]
				}
			],
			disallow: [
				{
					name: /^(figure|img|caption|figcaption)$/,
					attributes: 'data-validation-disallow'
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
