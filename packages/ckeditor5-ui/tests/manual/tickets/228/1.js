/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePresets ],
		toolbar: [ 'headings' ],
	} )
	.catch( err => console.error( err.stack ) );
