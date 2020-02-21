/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import HorizontalLine from '../../src/horizontalline';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: CS_CONFIG,
		plugins: [ ArticlePluginSet, ImageUpload, EasyImage, HorizontalLine ],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'numberedList', 'bulletedList',
			'|',
			'link', 'blockquote', 'imageUpload', 'insertTable', 'mediaEmbed',
			'|',
			'undo', 'redo',
			'|',
			'horizontalLine'
		],
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
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
