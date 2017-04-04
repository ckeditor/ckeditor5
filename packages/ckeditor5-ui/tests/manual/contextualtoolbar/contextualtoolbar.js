/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';

import ContextualToolbar from '../../../src/toolbar/contextualtoolbar';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'bold', 'italic', 'undo', 'redo', 'link' ]
} )
.then( editor => {
	const toolbar = new ContextualToolbar( editor );

	toolbar.addComponents( [ 'bold', 'italic' ] );

	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
