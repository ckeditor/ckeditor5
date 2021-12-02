/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor, CS_CONFIG */

ClassicEditor
	.create( document.querySelector( '#snippet-link-decorators' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		link: {
			addTargetToExternalLinks: true,
			decorators: [
				{
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				}
			]
		}
	} )
	.then( editor => {
		if ( !window.editors ) {
			window.editors = {};
		}
		window.editors.decorators = editor;

		const outputElement = document.querySelector( '#output-link-decorators' );

		outputElement.innerHTML = window.Prism.highlight( editor.getData(), window.Prism.languages.html, 'html' );

		editor.model.document.on( 'change', () => {
			outputElement.innerHTML = window.Prism.highlight( editor.getData(), window.Prism.languages.html, 'html' );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
