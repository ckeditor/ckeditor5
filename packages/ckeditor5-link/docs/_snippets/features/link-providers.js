/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { AutoLink } from 'ckeditor5';
import {
	CS_CONFIG,
	TOKEN_URL,
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { SocialLinksPlugin } from './build-link-source.js';

ClassicEditor
	.create( document.querySelector( '#snippet-link-providers' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [
			AutoLink,
			SocialLinksPlugin
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Link' ),
			text: 'Use to access a link list.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
