/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-image-semantical-style-custom' ), {
		removePlugins: [ 'ImageResize' ],
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		cloudServices: CS_CONFIG,
		image: {
			styles: {
				options: [ {
					name: 'side',
					icon: 'right',
					title: 'side',
					className: 'side',
					modelElements: [ 'image' ]
				}, {
					name: 'margin-left',
					icon: 'inlineLeft',
					title: 'margin-left',
					className: 'margin-left',
					modelElements: [ 'imageInline' ]
				}, {
					name: 'margin-right',
					icon: 'inlineRight',
					title: 'margin-right',
					className: 'margin-right',
					modelElements: [ 'imageInline' ]
				},
				'inline',
				'full'
				]
			},
			toolbar: [ 'imageStyle:inline', 'imageStyle:side', 'imageStyle:margin-left', 'imageStyle:margin-right', 'imageStyle:full', 'toggleImageCaption' ]
		}
	} )
	.then( editor => {
		window.editorStyle = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
