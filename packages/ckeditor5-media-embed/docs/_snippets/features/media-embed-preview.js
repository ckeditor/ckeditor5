/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

const IFRAME_SRC = '//ckeditor.iframe.ly/api/iframe';
const API_KEY = 'febab8169e71e501ae2e707f55105647';

ClassicEditor
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
				top: window.getViewportTopOffsetConfig()
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
		},
		licenseKey: 'GPL'
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item?.label === 'Insert media' ),
			text: 'Click to embed media.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// For a totally unknown reason, Travis and Vimeo do not like each other and the test fail on CI.
// Ignore errors from Facebook as well
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'request-failure': [ 'vimeo.com', 'facebook.com' ],
	'response-failure': [ 'vimeo.com', 'facebook.com', 'challenges.cloudflare.com' ],
	'console-error': [ '<svg> attribute preserveAspectRatio', 'vimeo.com', 'facebook.com', 'ErrorUtils', 'transparent NaN' ]
} );

document.head.appendChild( metaElement );
