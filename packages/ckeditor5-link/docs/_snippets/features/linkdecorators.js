/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, Worker, setTimeout, ClassicEditor, CS_CONFIG */

ClassicEditor
	.create( document.querySelector( '#snippet-link-decorators' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
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
		const worker = new Worker( window.umberto.relativeAppPath + '/highlight.worker.js' );

		worker.addEventListener( 'message', evt => {
			const data = JSON.parse( evt.data );

			outputElement.innerHTML = data.payload;
		} );

		editor.model.document.on( 'change', () => {
			worker.postMessage( JSON.stringify( {
				payload: editor.getData(),
				language: 'html'
			} ) );
		} );

		setTimeout( () => {
			worker.postMessage( JSON.stringify( {
				payload: editor.getData(),
				language: 'html'
			} ) );
		}, 500 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
