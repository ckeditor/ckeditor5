/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '../../src/classiceditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

window.editors = {};

function initEditor( element, placeholder ) {
	ClassicEditor
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
