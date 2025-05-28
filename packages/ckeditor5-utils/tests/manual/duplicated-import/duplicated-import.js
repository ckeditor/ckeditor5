/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// The CKEditor 5 library is loaded both here, and in HTML via CDN.
// Hence, we expect to throw the error:
// https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-ckeditor-duplicated-modules
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

ClassicEditor
	.create( document.querySelector( '#editor' ), {} )
	.catch( e => console.error( e ) );
