/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { MediaEditor } from './build-media-source.js';

MediaEditor
	.create( {
		attachTo: document.querySelector( '#snippet-media-embed-resize' ),
		cloudServices: CS_CONFIG,
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		mediaEmbed: {
			toolbar: [ 'resizeMediaEmbed' ],
			resizeOptions: [
				{ name: 'resizeMediaEmbed:original', value: null, icon: 'original' },
				{ name: 'resizeMediaEmbed:custom', value: 'custom', icon: 'custom' },
				{ name: 'resizeMediaEmbed:25', value: '25', icon: 'small' },
				{ name: 'resizeMediaEmbed:50', value: '50', icon: 'medium' },
				{ name: 'resizeMediaEmbed:75', value: '75', icon: 'large' }
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		}
	} )
	.then( editor => {
		window.editorMediaEmbedResize = editor;
		editor.sourceElement.nextSibling.classList.add( 'media-embed-resize-demo' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
