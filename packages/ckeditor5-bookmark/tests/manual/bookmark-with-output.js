/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document, setTimeout */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Table } from '@ckeditor/ckeditor5-table';
import { Image, ImageUpload, ImageInsert } from '@ckeditor/ckeditor5-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

import Bookmark from '../../src/bookmark.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor-with-output' ), {
		plugins: [
			Essentials, Link, LinkImage, Paragraph, Table, Image, ImageUpload,
			EasyImage, CloudServices, ImageInsert, Heading, Bold, Italic, Bookmark
		],
		toolbar: [
			'bookmark', '|',
			'undo', 'redo', '|',
			'bold', 'italic', '|',
			'insertImage', 'insertTable', '|',
			'heading', 'link'
		],
		cloudServices: CS_CONFIG,
		menuBar: {
			isVisible: true
		}
	} )
	.then( editor => {
		window.editor = editor;

		const iframe = document.querySelector( '#iframe' );

		editor.model.document.on( 'change', () => {
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write( editor.getData() );
			iframe.contentWindow.document.close();
		} );

		setTimeout( () => {
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write( editor.getData() );
			iframe.contentWindow.document.close();
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
