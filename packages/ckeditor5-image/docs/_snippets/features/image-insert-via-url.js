/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { ImageEditor } from './build-image-source.js';

// const toolbarItems = [ ...ImageEditor.defaultConfig.toolbar.items ];

// toolbarItems.splice( toolbarItems.indexOf( 'uploadImage' ), 1, 'insertImage' );

ImageEditor
	.create( document.querySelector( '#snippet-image-insert-via-url' ), {
		removePlugins: [ 'ArticlePluginSet', 'ImageCaption', 'LinkImage', 'AutoImage' ],
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
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'ckboxImageEdit'
			],
			insert: {
				integrations: [ 'url' ]
			}
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorInsertImageViaUrl = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
