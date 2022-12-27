/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import CodeblockCaption from '../../src/codeblockcaption';
import CodeBlock from '../../src/codeblock';
import CodeblockToolbar from '../../src/codeblocktoolbar';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ Code, CodeBlock, Autoformat, Indent, ArticlePluginSet, CodeblockCaption, CodeblockToolbar ],
		toolbar: [
			'heading', '|',
			'bold', 'italic', 'code', 'blockQuote', 'codeBlock', '|',
			'outdent', 'indent', '|',
			'undo', 'redo'
		],
		codeblock: {
			toolbar: [
				'toggleCodeblockCaption'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
