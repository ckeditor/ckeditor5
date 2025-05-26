/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			SourceEditing,
			GeneralHtmlSupport,
			PictureEditing
		],
		toolbar: [ 'sourceEditing', '|', 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList' ],
		image: {
			toolbar: [
				'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'imageTextAlternative'
			]
		},
		htmlSupport: {
			allow: [
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
