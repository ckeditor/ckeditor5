/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TOKEN_URL,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { SourceEditingEditor } from './source-editing-imports.js';

import './source-editing.css';

SourceEditingEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'undo', 'redo',
				'|', 'sourceEditing',
				'|', 'heading',
				'|', 'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code',
				'-', 'link', 'insertImage', 'insertTable', 'blockQuote', 'mediaEmbed', 'codeBlock',
				'|', 'alignment',
				'|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
			],
			shouldNotGroupWhenFull: true
		},
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			]
		},
		image: {
			toolbar: [
				'linkImage',
				'|',
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'imageTextAlternative',
				'toggleImageCaption',
				'|',
				'ckboxImageEdit'
			]
		},
		htmlSupport: {
			allow: [
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
						{ key: /.*/, value: /data:(?!image\/(png|jpg|jpeg|gif|webp))/i }
					]
				},
				{ name: 'script' }
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
		}
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Source' ),
			text: 'Switch to the source mode to edit the HTML source.',
			editor,
			tippyOptions: {
				placement: 'bottom-start'
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
