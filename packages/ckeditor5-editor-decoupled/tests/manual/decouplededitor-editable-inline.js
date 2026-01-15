/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { DecoupledEditor } from '../../src/decouplededitor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

DecoupledEditor
	.create( document.querySelector( '.editor__editable' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading, Bold, Italic ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ],
		modelRootElementName: '$inlineRoot',
		viewModelRootElementName: 'p' // TODO this is ignored as original element is reused
	} )
	.then( newEditor => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` and `editable` variables.' );

		document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );

		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
