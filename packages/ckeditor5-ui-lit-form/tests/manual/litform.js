/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import UIComponents from '@ckeditor/ckeditor5-ui-components/src/uicomponents.js';
import LitForm from '../../src/litform.js';

ClassicEditor
	.create( document.querySelector( '#editor1' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, LitForm, UIComponents ],
		toolbar: [
			'litform', 'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor1 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor2' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, LitForm, UIComponents ],
		toolbar: [
			'litform', 'heading', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor2 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
