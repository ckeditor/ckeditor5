/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import InlineEditor from '@ckeditor/ckeditor5-build-inline/src/ckeditor';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const inlineInjectElements = document.querySelectorAll( '#snippet-inline-editor [data-inline-inject]' );

Array.from( inlineInjectElements ).forEach( inlineElement => {
	const config = {
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ],
			styles: [ 'full', 'alignLeft', 'alignRight' ]
		},
		toolbar: {
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		cloudServices: CS_CONFIG
	};

	if ( inlineElement.tagName.toLowerCase() == 'header' ) {
		config.removePlugins = [
			'Blockquote',
			'Image',
			'ImageCaption',
			'ImageStyle',
			'ImageToolbar',
			'ImageUpload',
			'List',
			'EasyImage',
			'CKFinderUploadAdapter'
		];
		config.toolbar.items = [ 'heading', '|', 'bold', 'italic', 'link' ];
	}

	InlineEditor
		.create( inlineElement, config )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err );
		} );
} );
