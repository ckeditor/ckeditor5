/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

window.setInterval( function() {
	console.log( getData( window.editor.model ) );
}, 3000 );

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
