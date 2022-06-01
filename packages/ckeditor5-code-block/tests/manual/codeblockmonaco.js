/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

// import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
// import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
// import CodeBlock from '../../src/codeblock';
// import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
// import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
// import Indent from '@ckeditor/ckeditor5-indent/src/indent';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

( function() {
	// create div to avoid needing a HtmlWebpackPlugin template
	const div = document.createElement( 'div' );
	div.id = 'root';
	div.style = 'width:800px; height:600px; border:1px solid #ccc;';

	document.body.appendChild( div );
} )();

// monaco.editor.create( document.getElementById( 'root' ), {
// 	value: `const foo = () => 0;`,
// 	language: 'javascript',
// 	theme: 'vs-dark'
// } );
// ClassicEditor
// 	.create( document.querySelector( '#editor' ), {
// 		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
// 		plugins: [ Code, CodeBlock, Autoformat, Indent, ArticlePluginSet ],
// 		toolbar: [
// 			'heading', '|',
// 			'bold', 'italic', 'code', 'blockQuote', 'codeBlock', '|',
// 			'outdent', 'indent', '|',
// 			'undo', 'redo'
// 		]
// 	} )
// 	.then( editor => {
// 		window.editor = editor;
// 	} )
// 	.catch( err => {
// 		console.error( err.stack );
// 	} );
