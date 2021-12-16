/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( PageBreak );

ClassicEditor
	.create( document.querySelector( '#snippet-page-break' ), {
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'alignment',
				'|',
				'pageBreak',
				'blockQuote',
				'link',
				'uploadImage',
				'mediaEmbed',
				'insertTable',
				'|',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
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

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Page break' ),
			text: 'Click to insert a page break.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
