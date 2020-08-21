/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageUpload from '../../src/imageupload';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

ClassicEditor
	.create( document.querySelector( '#editor2' ), {
		plugins: [ ArticlePluginSet, ImageUpload, CKFinder ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'blockQuote',
			'imageUpload',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
			upload: {
				panel: {
					items: [
						'insertImageViaUrl',
						'openCKFinder'
					]
				}
			}
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		}
	} )
	.then( editor => {
		window.editor2 = editor;

		// Register fake adapter.
		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
			const adapterMock = new UploadAdapterMock( loader );

			return adapterMock;
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );
