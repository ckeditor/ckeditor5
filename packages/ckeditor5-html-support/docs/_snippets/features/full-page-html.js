/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import { FullPage, GeneralHtmlSupport } from 'ckeditor5';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

import './full-page-html.css';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import { GHSEditor } from './general-html-support-source.js';

GHSEditor
	.create( document.querySelector( '#snippet-full-page-html' ), {
		extraPlugins: [
			ArticlePluginSet,
			FullPage,
			GeneralHtmlSupport
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'sourceEditingEnhanced', '|', 'heading',
				'|', 'bold', 'italic', 'code',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
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
				'toggleImageCaption',
				'imageTextAlternative',
				'ckboxImageEdit'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG,
		htmlSupport: {
			allow: [
				// Enables all HTML features.
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			],
			disallow: [
				{
					attributes: [
						{ key: /^on(.*)/i, value: true },
						{ key: /.*/, value: /(\b)(on\S+)(\s*)=|javascript:|(<\s*)(\/*)script/i },
						{ key: /.*/, value: /data:(?!image\/(png|jpeg|gif|webp))/i }
					]
				},
				{ name: 'script' }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Source' ),
			text: 'Switch to the source mode to check out the source of the content and play with it.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
