/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

ClassicEditor
	.create( document.querySelector( '#snippet-autoformat' ), {
		plugins: ClassicEditor.build.plugins.concat( [ Code ] ),
		toolbar: {
			items: [
				'headings',
				'|',
				'bold',
				'italic',
				'code',
				'link',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'undo',
				'redo'
			],
			viewportTopOffset: 60
		},
		cloudServices: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
