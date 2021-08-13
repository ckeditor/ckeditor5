/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window */

import ClassicEditor from '../../../../src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

let editor;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
		toolbar: {
			items: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
		},
		ui: {
			viewportOffset: {
				top: 100
			}
		}
	} )
	.then( newEditor => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` and `editable` variables.' );

		window.editor = editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const button = document.querySelector( '#change-offset' );

button.addEventListener( 'click', () => {
	const getRandomBetween = ( min, max ) => Math.random() * ( max - min ) + min;
	const random = getRandomBetween( 100, 200 );
	document.documentElement.style.setProperty( '--top-offset', `${ random }px` );
	editor.ui.view.stickyPanel.viewportTopOffset = random;
} );
