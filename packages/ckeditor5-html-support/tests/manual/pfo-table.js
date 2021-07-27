/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Bold,
			Essentials,
			GeneralHtmlSupport,
			Italic,
			Heading,
			List,
			Image,
			Paragraph,
			SourceEditing,
			Strikethrough,
			Table,
			TableCaption
		],
		toolbar: [ 'insertTable', '|', 'bold', 'italic', 'strikethrough', '|', 'sourceEditing' ],
		htmlSupport: {
			allow: [
				{
					name: /^(figure|table|tbody|thead|tr|th|td|caption|figcaption|span|p|img)$/,
					attributes: [ 'valign' ],
					styles: true,
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
