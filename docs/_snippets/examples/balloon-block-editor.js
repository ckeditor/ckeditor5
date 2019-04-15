/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import BalloonEditor from '@ckeditor/ckeditor5-build-balloon-block/src/ckeditor';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

BalloonEditor
	.create( document.querySelector( '#snippet-balloon-block-editor' ), {
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
