/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import ImageInsert from '../../../../src/imageinsert.js';
import ImageResize from '../../../../src/imageresize.js';

import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

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
