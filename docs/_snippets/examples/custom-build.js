/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-custom-build' ), {
		plugins: [
			Essentials,
			Paragraph,
			Bold,
			Italic,
			Underline,
			Strikethrough,
			Code,
			Highlight,
			EasyImage
		],
		toolbar: {
			items: [ 'bold', 'italic', 'underline', 'strikethrough', 'code', '|', 'highlight', '|', 'undo', 'redo' ],
			viewportTopOffset: 100
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
