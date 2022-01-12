/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
			toolbar: [ 'mediaEmbed' ]
		},
		htmlSupport: {
			allow: [
				{
					name: /^(figure|oembed)$/,
					attributes: [ 'data-validation-allow' ],
					classes: [ 'allowed-class' ],
					styles: {
						color: 'blue'
					}
				}
			],
			disallow: [
				{
					name: /^(figure|oembed)$/,
					attributes: 'data-validation-disallow',
					classes: [ 'disallowed-class' ],
					styles: {
						color: 'red'
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

ClassicEditor
	.create( document.querySelector( '#editor-custom-element-name' ), {
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
			elementName: 'custom-oembed',
			toolbar: [ 'mediaEmbed' ]
		},
		htmlSupport: {
			allow: [
				{
					name: /^(figure|custom-oembed)$/,
					attributes: [ 'data-validation-allow' ],
					classes: [ 'allowed-class' ],
					styles: {
						color: 'blue'
					}
				}
			],
			disallow: [
				{
					name: /^(figure|custom-oembed)$/,
					attributes: 'data-validation-disallow',
					classes: [ 'disallowed-class' ],
					styles: {
						color: 'red'
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
