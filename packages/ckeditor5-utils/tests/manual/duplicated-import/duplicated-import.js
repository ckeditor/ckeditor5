/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import '@ckeditor/ckeditor5-core/src/editor/editor';

ClassicEditor
	.create( document.querySelector( '#editor' ), {} )
	.catch( e => console.error( e ) );
