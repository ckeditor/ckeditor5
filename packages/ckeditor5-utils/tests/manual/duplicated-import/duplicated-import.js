/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import '@ckeditor/ckeditor5-core/src/editor/editor.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {} )
	.catch( e => console.error( e ) );
