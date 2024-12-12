/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals window, document, console */

import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { CKBox, CKBoxImageEdit } from '@ckeditor/ckeditor5-ckbox';
import { PictureEditing, ImageInsert, ImageResize, AutoImage } from '@ckeditor/ckeditor5-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic.js';

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
				top: window.getViewportTopOffsetConfig()
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
		cloudServices: CS_CONFIG,
		licenseKey: 'GPL'
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
