/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	CloudServices,
	ImageInsert,
	ImageUpload,
	PictureEditing,
	CKBox,
	CKBoxImageEdit
} from 'ckeditor5';
import MathType from '@wiris/mathtype-ckeditor5/dist/index.js';
import {
	TOKEN_URL,
	CS_CONFIG,
	ArticlePluginSet,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor
	.create( document.querySelector( '#mathtype-editor' ), {
		plugins: [
			ArticlePluginSet,
			CKBox,
			CKBoxImageEdit,
			PictureEditing,
			ImageUpload,
			ImageInsert,
			CloudServices,
			MathType
		],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', '|', 'MathType', 'ChemType',
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
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
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

		attachTourBalloon( {
			target: findToolbarItem(
				editor.ui.view.toolbar,
				item => item.label && item.label === 'Insert a math equation - MathType'
			),
			text: 'Click to insert mathematical or chemical formulas.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// MathType has a WASM telemetry file that esbuild fails to generate. Because
// the code works fine without it, then we accept the error during a scan.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'response-failure': 'wasm'
} );

document.head.appendChild( metaElement );
