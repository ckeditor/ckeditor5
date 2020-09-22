/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

const toolbarItems = [ ...ClassicEditor.defaultConfig.toolbar.items ];

toolbarItems.splice( toolbarItems.indexOf( 'imageUpload' ), 1, 'imageInsert' );

ClassicEditor
	.create( document.querySelector( '#snippet-image-insert-via-url' ), {
		removePlugins: [ 'ImageToolbar', 'ImageCaption', 'ImageStyle', 'ImageResize', 'LinkImage' ],
		toolbar: {
			items: toolbarItems,
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorInsertImageViaUrl = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
