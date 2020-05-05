/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import InlineEditor from '../../src/inlineeditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

window.editors = {};

function initEditor( element, placeholder ) {
	InlineEditor
		.create( element, {
			plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
			toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ],
			placeholder
		} )
		.then( newEditor => {
			console.log( 'Editor was initialized', newEditor );

			window.editors[ element.id ] = newEditor;
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

initEditor( document.querySelector( '#editor-1' ) );
initEditor( document.querySelector( '#editor-2' ), 'The placeholder from editor.config.placeholder' );
