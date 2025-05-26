/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import CodeBlock from '../../src/codeblock.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		language: 'ar',
		plugins: [ Code, CodeBlock, ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'code', 'blockQuote', 'codeBlock', 'undo', 'redo', 'insertTable' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
