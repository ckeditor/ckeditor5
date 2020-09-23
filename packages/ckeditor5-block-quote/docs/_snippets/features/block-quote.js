/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

ClassicEditor.builtinPlugins.push( Alignment );

ClassicEditor
	.create( document.querySelector( '#snippet-block-quote' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'|',
				'alignment',
				'|',
				'blockQuote',
				'outdent',
				'indent',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;

		// The "Print editor data" button logic.
		document.querySelector( '#print-data-action' ).addEventListener( 'click', () => {
			const snippetCSSElement = [ ...document.querySelectorAll( 'link' ) ]
				.find( linkElement => linkElement.href.endsWith( 'snippet.css' ) );

			const iframeElement = document.querySelector( '#print-data-container' );

			iframeElement.srcdoc = '<html>' +
				'<head>' +
					`<title>${ document.title }</title>` +
					`<link rel="stylesheet" href="${ snippetCSSElement.href }" type="text/css">` +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
					'<script>' +
						'window.addEventListener( \'DOMContentLoaded\', () => { window.print(); } );' +
					'</script>' +
				'</body>' +
				'</html>';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
