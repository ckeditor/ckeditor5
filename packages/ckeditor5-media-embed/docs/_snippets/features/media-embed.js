/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-media-embed' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.buttonView && item.buttonView.label && item.buttonView.label === 'Insert media' ),
			text: 'Click to embed media.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Due to unknown reasons, Travis cannot load video from Vimeo. Let's ignore this error.
const metaElement = document.createElement( 'meta' );

metaElement.name = 'x-cke-crawler-ignore-patterns';
metaElement.content = JSON.stringify( {
	'response-failure': 'vimeo.com',
	'console-error': '<svg> attribute preserveAspectRatio'
} );

document.head.appendChild( metaElement );
