/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { PageBreak, Alignment, CKBox, CKBoxImageEdit, PictureEditing, ImageInsert, ImageResize, AutoImage, LinkImage } from 'ckeditor5';
import {
	TOKEN_URL,
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor.builtinPlugins.push(
	Alignment,
	PageBreak,
	PictureEditing,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit );

ClassicEditor
	.create( document.querySelector( '#snippet-page-break' ), {
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'pageBreak',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
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
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
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
			const stylesheets = [
				'ckeditor5.css',
				'ckeditor5-premium-features.css'
			];

			const links = Array
				.from( document.querySelectorAll( 'link' ) )
				.filter( element => stylesheets.some( name => element.href.endsWith( name ) ) );

			const iframeElement = document.querySelector( '#print-data-container' );

			iframeElement.srcdoc = '<html>' +
				'<head>' +
					`<title>${ document.title }</title>` +
					links.map( link => `<link rel="stylesheet" href="${ link.href }">` ).join( '' ) +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
					'<script>' +
						'window.addEventListener( \'DOMContentLoaded\', () => { window.print(); } );' +
					'</script>' +
				'</body>' +
				'</html>';
		} );

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Page break' ),
			text: 'Click to insert a page break.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
