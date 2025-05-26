/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';

const config = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [ ArticlePluginSet, Strikethrough, Code, Highlight ],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'strikethrough', 'code', 'link', '|', 'highlight', '|', 'undo', 'redo' ]
};

ClassicEditor
	.create( document.querySelector( '#editor-classic' ), config )
	.then( editor => {
		window.classicEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

BalloonEditor
	.create( document.querySelector( '#editor-balloon' ), config )
	.then( editor => {
		window.balloonEditor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
