/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import { Strikethrough, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Highlight } from '@ckeditor/ckeditor5-highlight';

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
