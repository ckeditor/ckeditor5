/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global CKEditorInspector, document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageResize from '../../src/imageresize';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '../../src/imageupload';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

( async () => {
	const editor = await ClassicEditor
		.create( document.querySelector( '#editor-percentage' ), {
			plugins: [
				ArticlePluginSet, EasyImage, CloudServices, ImageUpload, ImageResize
			],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertTable',
				'uploadImage',
				'mediaEmbed',
				'undo',
				'redo'
			],
			image: {
				// resizeUnit: 'px',
				toolbar: [
					'toggleImageCaption', '|',
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
					'|',
					'imageTextAlternative', '|',
					'resizeImage'
				]
			}
		} );

	window.editor = editor;

	editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
		const adapterMock = new UploadAdapterMock( loader );

		return adapterMock;
	};
} )();

( async () => {
	const editor = await ClassicEditor
		.create( document.querySelector( '#editor-px' ), {
			plugins: [
				ArticlePluginSet, EasyImage, CloudServices, ImageUpload, ImageResize
			],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertTable',
				'uploadImage',
				'mediaEmbed',
				'undo',
				'redo'
			],
			image: {
				resizeUnit: 'px',
				toolbar: [
					'toggleImageCaption', '|',
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
					'|',
					'imageTextAlternative', '|',
					'resizeImage'
				]
			}
		} );

	window.editor = editor;

	editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
		const adapterMock = new UploadAdapterMock( loader );

		return adapterMock;
	};
} )();
