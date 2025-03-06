/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { TextTransformationEditor } from './build-text-transformation-source.js';

TextTransformationEditor
	.create( document.querySelector( '#snippet-text-transformation-extended' ), {
		cloudServices: CS_CONFIG,
		placeholder: 'Type here...',
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
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
		typing: {
			transformations: {
				remove: [
					// Do not use the transformations from the
					// 'symbols' and 'quotes' groups.
					'symbols',
					'quotes',

					// As well as the following transformations.
					'arrowLeft',
					'arrowRight'
				],

				extra: [
					// Add some custom transformations – e.g. for emojis.
					{ from: ':)', to: '🙂' },
					{ from: ':+1:', to: '👍' },
					{ from: ':tada:', to: '🎉' },

					// You can also define patterns using regular expressions.
					// Note: The pattern must end with `$` and all its fragments must be wrapped
					// with capturing groups.
					// The following rule replaces ` "foo"` with ` «foo»`.
					{
						from: /(^|\s)(")([^"]*)(")$/,
						to: [ null, '«', null, '»' ]
					},

					// Finally, you can define `to` as a callback.
					// This (naive) rule will auto-capitalize the first word after a period, question mark, or an exclamation mark.
					{
						from: /([.?!] )([a-z])$/,
						to: matches => [ null, matches[ 1 ].toUpperCase() ]
					}
				]
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
