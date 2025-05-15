/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	TOKEN_URL,
	CS_CONFIG,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import { MediaEditor } from './build-media-source.js';

const IFRAME_SRC = '//ckeditor.iframe.ly/api/iframe';
const API_KEY = 'febab8169e71e501ae2e707f55105647';

MediaEditor
	.create( document.querySelector( '#snippet-media-embed-preview' ), {
		cloudServices: CS_CONFIG,
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
		mediaEmbed: {
			previewsInData: false,
			providers: [
				{
					name: 'iframely previews',
					url: /.+/,
					html: match => {
						const url = match[ 0 ];
						const iframeUrl = IFRAME_SRC + '?app=1&key=' + API_KEY + '&url=' + encodeURIComponent( url ) + '&consent=0';

						return (
							'<div class="iframely-embed">' +
								'<div class="iframely-responsive">' +
									`<iframe src="${ iframeUrl }" ` +
										'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
									'</iframe>' +
								'</div>' +
							'</div>'
						);
					}
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item?.label === 'Insert media' ),
			text: 'Click to embed media.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'console-error': [ '<svg> attribute preserveAspectRatio', 'ErrorUtils', 'transparent NaN' ]
} );

document.head.appendChild( metaElement );
