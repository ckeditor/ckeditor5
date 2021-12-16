/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import PageBreak from '../../src/pagebreak';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: CS_CONFIG,
		plugins: [ ArticlePluginSet, ImageUpload, CloudServices, EasyImage, PageBreak ],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'numberedList', 'bulletedList',
			'|',
			'link', 'blockquote', 'uploadImage', 'insertTable', 'mediaEmbed',
			'|',
			'undo', 'redo',
			'|',
			'pageBreak'
		],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
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

		// Generate "Editor content preview".
		const contentPreviewBox = document.getElementById( 'preview' );
		contentPreviewBox.innerHTML = editor.getData();
		editor.model.document.on( 'change:data', () => {
			contentPreviewBox.innerHTML = editor.getData();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
