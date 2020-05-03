/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, window, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

const config = {
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
