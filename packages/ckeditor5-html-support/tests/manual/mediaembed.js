/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			GeneralHtmlSupport,
			Essentials,
			Paragraph,
			SourceEditing,
			MediaEmbed,
			MediaEmbedToolbar
		],
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		toolbar: [ 'mediaEmbed', '|', 'sourceEditing' ],
		mediaEmbed: {
			// previewsInData: true,

			// elementName: 'xemebd',
			toolbar: [ 'mediaEmbed' ]
		},
		htmlSupport: {
			allow: [
				{
					name: /^(figure|table|tbody|thead|tr|th|td|caption|figcaption|oembed)$/,
					attributes: [ 'data-validation-allow', 'data-validation-disallow' ]
				}
			],
			disallow: [
				{
					name: /^(figure|table|tbody|thead|tr|th|td|caption|figcaption|oembed)$/,
					attributes: 'data-validation-disallow'
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
