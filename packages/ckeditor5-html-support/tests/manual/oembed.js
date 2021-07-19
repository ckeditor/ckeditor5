/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePluginSet,
			GeneralHtmlSupport,
			SourceEditing,
			Strikethrough,
			MediaEmbed,
			MediaEmbedToolbar
		],
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		toolbar: [ 'mediaEmbed', '|', 'bold', 'italic', 'strikethrough', '|', 'sourceEditing' ],
		mediaEmbed: {
			previewsInData: true,
			toolbar: [ 'blockQuote' ]
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
