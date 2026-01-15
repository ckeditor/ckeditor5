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

const container = document.querySelector( '.container' );

ClassicEditor
	.create( '<h2>Hello world!</h2><p>This is an editor instance.</p>', {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ],
		modelRootElementName: '$inlineRoot',
		viewRootElementName: 'p'
	} )
	.then( editor => {
		window.editor = editor;
		container.appendChild( editor.ui.element );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
