/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import InlineEditor from '@ckeditor/ckeditor5-build-inline/src/ckeditor';

ClassicEditor
	.create( document.querySelector( '#editor-classic' ) )
	.then( editor => {
		console.log( editor );
		// window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

InlineEditor
	.create( document.querySelector( '#editor-inline' ) )
	.then( editor => {
		console.log( editor );
		// window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
