/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

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
