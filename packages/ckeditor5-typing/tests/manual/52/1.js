/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { _getModelData } from '@ckeditor/ckeditor5-engine';

window.setInterval( function() {
	console.log( _getModelData( window.editor.model ) );
}, 3000 );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
