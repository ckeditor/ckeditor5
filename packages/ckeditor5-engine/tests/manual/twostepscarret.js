/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import bindTwoStepCaretToAttribute from '@ckeditor/ckeditor5-engine/src/utils/bindtwostepcarettoattribute';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Underline, Bold ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'underline' ]
	} )
	.then( editor => {
		bindTwoStepCaretToAttribute( editor, editor, 'underline' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
