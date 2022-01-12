/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import ImageResize from '../../src/imageresize';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '../../src/imageupload';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

( async () => {
	window.editorPx = await createEditor( document.querySelector( '#editor-px' ), 'px' );
	window.editorPercent = await createEditor( document.querySelector( '#editor-percent' ), '%' );

	CKEditorInspector.attach( {
		px: window.editorPx,
		percent: window.editorPercent
	} );
} )();

async function createEditor( element, resizeUnit ) {
	const editor = await ClassicEditor
		.create( element, {
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
				resizeUnit,
				toolbar: [
					'imageStyle:inline',
					'imageStyle:wrapText',
					'imageStyle:breakText',
					'|',
					'toggleImageCaption',
					'imageTextAlternative', '|',
					'resizeImage'
				]
			}
		} );

	editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
		const adapterMock = new UploadAdapterMock( loader );

		return adapterMock;
	};

	return editor;
}
