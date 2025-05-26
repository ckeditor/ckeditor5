/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageUpload, ImageInsert, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table } from '@ckeditor/ckeditor5-table';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';

import Bookmark from '../../src/bookmark.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const config = {
	plugins: [
		Essentials, Link, List, LinkImage, Paragraph, Table, Image, ImageUpload, ImageStyle, ImageToolbar,
		CodeBlock, BlockQuote, EasyImage, CloudServices, ImageInsert, Heading, Bold, Italic, PasteFromOffice, Bookmark
	],
	toolbar: [
		'bookmark', '|',
		'undo', 'redo', '|',
		'heading', '|',
		'bold', 'italic', '|',
		'link', 'insertImage', 'insertTable', 'codeBlock', 'blockQuote', '|',
		'bulletedList', 'numberedList'
	],
	cloudServices: CS_CONFIG,
	menuBar: {
		isVisible: true
	},
	placeholder: 'Paste sme content from MS Word or Excel here...',
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:wrapText',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor-with-paste-from-office' ), config )
	.then( editor => {
		window.editor = editor;
		CKEditorInspector.attach( { editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
