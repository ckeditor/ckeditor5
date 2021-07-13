/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

import DrupalImage from '../../src/drupalimage';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			Image,
			ImageInsert,
			ImageUpload,
			DrupalImage
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'uploadImage',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:alignLeft', 'imageStyle:alignRight'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		// Register fake adapter.
		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
			const adapterMock = new UploadAdapterMock( loader );

			loader.file.then( () => {
				window.setTimeout( () => adapterMock.mockSuccess( {
					default: './sample.jpg',
					uuid: '0000-aaaaaa-bbbbbb-1111',
					entity_type: 'file'
				} ), 1000 );
			} );

			return adapterMock;
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );
