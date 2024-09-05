/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Table } from '@ckeditor/ckeditor5-table';
import { Image, ImageUpload, ImageInsert } from '@ckeditor/ckeditor5-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Link, LinkImage, Typing, Paragraph, Undo, Enter, Table, Image, ImageUpload,
			EasyImage, CloudServices, ImageInsert, Heading
		],
		toolbar: [
			'undo', 'redo', '|',
			'insertImage', 'insertTable', '|',
			'heading', 'link'
		],
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
