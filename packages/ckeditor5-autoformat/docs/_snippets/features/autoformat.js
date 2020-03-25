/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#snippet-autoformat' ), {
		plugins: ClassicEditor.builtinPlugins.concat( [ Code, CodeBlock, Strikethrough ] ),
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'strikethrough',
				'code',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'codeBlock',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editorBasic = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
