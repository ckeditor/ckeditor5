/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const IFRAME_SRC = '//cdn.iframe.ly/api/iframe';
const API_KEY = 'febab8169e71e501ae2e707f55105647';

ClassicEditor
	.create( document.querySelector( '#snippet-media-embed-preview' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		mediaEmbed: {
			previewsInData: false,
			providers: [
				{
					name: 'iframely previews',
					url: /.+/,
					html: match => {
						const url = match[ 0 ];
						const iframeUrl = IFRAME_SRC + '?app=1&key=' + API_KEY + '&url=' + encodeURIComponent( url );

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

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Insert media' ),
			text: 'Click to embed media.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// For a totally unknown reason, Travis and Vimeo do not like each other and the test fail on CI.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'request-failure': 'vimeo.com',
	'response-failure': 'vimeo.com',
	'console-error': [ '<svg> attribute preserveAspectRatio', 'vimeo.com' ]
} );

document.head.appendChild( metaElement );
