/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import ImageInsert from '../../../../src/imageinsert';
import ImageResize from '../../../../src/imageresize';

import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, HtmlEmbed, ImageInsert, ImageResize ],
		toolbar: [ 'insertImage', '|', 'htmlEmbed' ],
		htmlEmbed: {
			showPreviews: true
		}
	} )
	.then( editor => {
		window.editor = editor;

		editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
			return new UploadAdapterMock( loader );
		};
	} )
	.catch( err => {
		console.error( err.stack );
	} );
