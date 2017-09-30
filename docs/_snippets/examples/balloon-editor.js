/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon/src/ckeditor';
import getToken from '@ckeditor/ckeditor5-easy-image/tests/_utils/gettoken';

getToken()
	.then( token => {
		return BalloonEditor
			.create( document.querySelector( '#snippet-balloon-editor' ), {
				cloudServices: { token }
			} )
			.then( editor => {
				window.editor = editor;
			} );
	} )
	.catch( err => {
		console.error( err );
	} );
