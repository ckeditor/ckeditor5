/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import InlineEditor from '@ckeditor/ckeditor5-build-inline/src/ckeditor';
import getToken from '@ckeditor/ckeditor5-easy-image/tests/_utils/gettoken';

const inlineInjectElements = document.querySelectorAll( '#snippet-inline-editor [data-inline-inject]' );

Array.from( inlineInjectElements ).forEach( inlineElement => {
	const config = {
		image: {
			toolbar: [ 'imageTextAlternative', '|', 'imageStyleAlignLeft', 'imageStyleFull', 'imageStyleAlignRight' ],
			styles: [ 'imageStyleFull', 'imageStyleAlignLeft', 'imageStyleAlignRight' ]
		},
		toolbar: {
			viewportTopOffset: 60
		}
	};

	if ( inlineElement.tagName.toLowerCase() == 'header' ) {
		config.removePlugins = [ 'Blockquote', 'Image', 'ImageToolbar', 'List', 'EasyImage', 'ImageUpload', 'CKFinderUploadAdapter' ];
		config.toolbar.items = [ 'headings', 'bold', 'italic', 'link' ];
	}

	getToken()
		.then( token => {
			config.cloudServices = { token };

			return InlineEditor
				.create( inlineElement, config )
				.then( editor => {
					window.editor = editor;
				} );
		} )
		.catch( err => {
			console.error( err );
		} );
} );
