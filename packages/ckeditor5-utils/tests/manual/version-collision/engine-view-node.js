/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import '@ckeditor/ckeditor5-engine/src/view/node';

ClassicEditor
	.create( document.querySelector( '#editor' ), {} )
	.catch( e => console.error( e ) );
