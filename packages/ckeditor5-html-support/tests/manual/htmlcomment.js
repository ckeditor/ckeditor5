/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import HtmlComment from '../../src/htmlcomment.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			BlockQuote,
			Bold,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			Indent,
			Italic,
			Link,
			MediaEmbed,
			Paragraph,
			List,
			CloudServices,
			EasyImage,
			ImageUpload,
			PasteFromOffice,
			SourceEditing,
			Table,
			TableToolbar,
			TodoList,
			HtmlComment
		],
		cloudServices: CS_CONFIG,
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'todoList', '|',
			'blockQuote', 'uploadImage', 'insertTable', '|',
			'sourceEditing', '|',
			'undo', 'redo'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
