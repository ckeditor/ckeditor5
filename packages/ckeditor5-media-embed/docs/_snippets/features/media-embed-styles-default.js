/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { MediaEmbedStyle, MediaEmbedToolbar } from 'ckeditor5';
import { MediaEditor } from './build-media-source.js';

MediaEditor
	.create( {
		attachTo: document.querySelector( '#snippet-media-embed-styles-default' ),
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
			toolbar: [ 'mediaEmbed:breakText', 'mediaEmbed:wrapText' ]
		}
	} )
	.then( editor => {
		window.editorMediaEmbedStylesDefault = editor;
		editor.sourceElement.nextSibling.classList.add( 'media-styles-default-demo' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
