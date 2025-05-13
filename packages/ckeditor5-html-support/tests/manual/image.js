/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			LinkImage,
			SourceEditing,
			GeneralHtmlSupport
		],
		toolbar: [ 'sourceEditing', '|', 'link', '|', 'heading', '|', 'undo', 'redo', 'bold', 'italic', 'bulletedList', 'numberedList' ],
		image: {
			toolbar: [
				'linkImage', '|',
				'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'imageTextAlternative'
			]
		},
		htmlSupport: {
			allow: [
				{
					name: /^(figure|img|caption|figcaption|a)$/,
					attributes: [ 'alt', 'data-validation-allow' ],
					classes: [ 'allowed-class', 'allowed-class-second' ],
					styles: {
						'color': 'blue'
					}
				}
			],
			disallow: [
				{
					name: /^(figure|img|caption|figcaption|a)$/,
					attributes: [ 'data-validation-disallow' ],
					classes: [ 'disallowed-class' ],
					styles: {
						'color': 'red'
					}
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
