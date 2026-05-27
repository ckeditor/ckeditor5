/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import {
	IconNextArrow,
	IconObjectFullWidth,
	IconPreviousArrow,
	MediaEmbedStyle,
	MediaEmbedToolbar
} from 'ckeditor5';
import { MediaEditor } from './build-media-source.js';

MediaEditor
	.create( {
		attachTo: document.querySelector( '#snippet-media-embed-styles-custom' ),
		extraPlugins: [ MediaEmbedToolbar, MediaEmbedStyle ],
		cloudServices: CS_CONFIG,
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic', 'link',
				'|', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		mediaEmbed: {
			toolbar: [
				{
					name: 'mediaEmbed:asideMedia',
					title: 'Aside media',
					items: [ 'mediaEmbed:asideLeft', 'mediaEmbed:asideRight' ],
					defaultItem: 'mediaEmbed:asideRight'
				},
				'mediaEmbed:featured'
			],
			styles: {
				options: [
					{
						name: 'featured',
						title: 'Featured media',
						icon: IconObjectFullWidth,
						className: 'media-style-featured'
					},
					{
						name: 'asideLeft',
						title: 'Aside (left)',
						icon: IconPreviousArrow,
						className: 'media-style-aside-left'
					},
					{
						name: 'asideRight',
						title: 'Aside (right)',
						icon: IconNextArrow,
						className: 'media-style-aside-right'
					}
				]
			}
		}
	} )
	.then( editor => {
		window.editorMediaEmbedStylesCustom = editor;
		editor.sourceElement.nextSibling.classList.add( 'media-styles-custom-demo' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
