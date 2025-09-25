/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	HtmlEmbed,
	CodeBlock,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	HorizontalLine,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage
} from 'ckeditor5';
import {
	TOKEN_URL,
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor.builtinPlugins.push(
	HtmlEmbed,
	CodeBlock,
	PictureEditing,
	HorizontalLine,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit );

ClassicEditor
	.create( document.querySelector( '#snippet-html-embed' ), {
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'htmlEmbed',
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

		const refreshIframeContent = window.umberto.throttle( () => {
			const stylesheets = [
				'css/styles.css',
				'ckeditor5.css',
				'ckeditor5-premium-features.css'
			];

			const links = Array
				.from( document.querySelectorAll( 'link' ) )
				.filter( element => stylesheets.some( name => element.href.endsWith( name ) ) );

			const { iframe } = document.querySelector( '#preview-data-container' );

			// We create the iframe in a careful way and set the base URL to make emojics widget work.
			// NOTE: the emojics widget works only when hosted on ckeditor.com.
			iframe.setContent(
				'<!DOCTYPE html><html>' +
				'<head>' +
					'<meta charset="utf-8">' +
					`<base href="${ location.href }">` +
					`<title>${ document.title }</title>` +
					links.map( link => `<link rel="stylesheet" href="${ link.href }">` ).join( '' ) +
					`<style>
						body {
							padding: 20px;
						}
						.formatted p img {
							display: inline;
							margin: 0;
						}
					</style>` +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
				'</body>' +
				'</html>'
			);
		}, 200 );

		editor.model.document.on( 'change:data', refreshIframeContent );

		refreshIframeContent();
		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Insert HTML' ),
			text: 'Click to embed a new HTML snippet.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
