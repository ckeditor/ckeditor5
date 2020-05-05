/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CodeBlock from '../../src/codeblock';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Code, CodeBlock, Autoformat, Indent, ArticlePluginSet ],
		toolbar: [
			'heading', '|',
			'bold', 'italic', 'code', 'blockQuote', 'codeBlock', '|',
			'outdent', 'indent', '|',
			'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
