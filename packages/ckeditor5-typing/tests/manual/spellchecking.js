/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

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
