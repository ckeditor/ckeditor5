/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import InlineEditor from '../../src/inlineeditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

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
