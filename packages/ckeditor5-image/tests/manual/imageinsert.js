/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import ImageInsert from '../../src/imageinsert';
import AutoImage from '../../src/autoimage';

createEditor( 'editor1', 'auto' );
createEditor( 'editor2', 'block' );
createEditor( 'editor3', 'inline' );

function createEditor( elementId, imageType ) {
	ClassicEditor
		.create( document.querySelector( '#' + elementId ), {
			plugins: [ ArticlePluginSet, ImageInsert, AutoImage, LinkImage, CKFinderUploadAdapter, CKFinder ],
			toolbar: [
				'heading',
				'|',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'insertImage',
				'insertTable',
				'mediaEmbed',
				'undo',
				'redo'
			],
			image: {
				toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ],
				insert: {
					integrations: [
						'insertImageViaUrl',
						'openCKFinder'
					],
					type: imageType
				}
			},
			ckfinder: {
				// eslint-disable-next-line max-len
				uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
			}
		} )
		.then( editor => {
			window[ elementId ] = editor;

			CKEditorInspector.attach( { [ imageType ]: editor } );
		} )
		.catch( err => {
			console.error( err );
		} );
}
