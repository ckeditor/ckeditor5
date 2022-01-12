/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import FindAndReplace from '../../src/findandreplace';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

// Note: We need to load paragraph because we don't have inline editors yet.
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, FindAndReplace, Highlight, ArticlePluginSet, FontColor, SourceEditing ],
		toolbar: [ 'findAndReplace', '|', 'sourceEditing', '|', 'heading', 'undo', 'redo', 'highlight', 'bold', 'fontColor' ],
		image: {
			toolbar: [
				'toggleImageCaption', 'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.getElementById( 'readonly-toggle' ).addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
