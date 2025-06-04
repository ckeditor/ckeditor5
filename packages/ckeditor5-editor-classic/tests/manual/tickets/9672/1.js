/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '../../../../src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

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
const buttonInterval = document.querySelector( '#change-offset-interval' );

let intervalRunning = false;
let interval = null;

const update = () => {
	const getRandomBetween = ( min, max ) => Math.random() * ( max - min ) + min;
	const random = getRandomBetween( 100, 200 );
	document.documentElement.style.setProperty( '--top-offset', `${ random }px` );
	editor.ui.viewportOffset = { top: random };
};

const updateAndFocus = () => {
	update();
	editor.editing.view.focus();
};

const updateAndChangeLayout = () => {
	update();
	editor.editing.view.document.fire( 'layoutChanged' );
};

const handleInterval = () => {
	if ( intervalRunning ) {
		clearInterval( interval );
		intervalRunning = false;
	} else {
		interval = setInterval( updateAndChangeLayout, 2000 );
		intervalRunning = true;
	}
};

const updateFocusAndChangeLayout = () => {
	editor.editing.view.focus();
	handleInterval();
};

button.addEventListener( 'click', updateAndFocus );
buttonInterval.addEventListener( 'click', updateFocusAndChangeLayout );
