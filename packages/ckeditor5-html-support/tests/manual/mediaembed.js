/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import GeneralHtmlSupport from '../../src/generalhtmlsupport.js';

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
