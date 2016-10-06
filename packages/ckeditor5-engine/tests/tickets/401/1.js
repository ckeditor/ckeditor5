/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import Bold from '/ckeditor5/basic-styles/bold.js';

ClassicEditor.create( document.getElementById( 'editor' ), {
	features: [ 'enter', 'typing', 'paragraph', Bold ],
	toolbar: [ 'bold' ]
} );
