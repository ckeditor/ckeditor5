/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ShowBlocks } from '../../src/showblocks.js';

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

const roots = {
	intro: { element: document.querySelector( '#editor-intro' ) },
	content: { element: document.querySelector( '#editor-content' ) },
	outro: { element: document.querySelector( '#editor-outro' ) }
};

MultiRootEditor
	.create( {
		roots,
		plugins: [ Essentials, Paragraph, Heading, Bold, Italic, ShowBlocks ],
		toolbar: [ 'showBlocks', '|', 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( newEditor => {
		console.log( 'Editor was initialized', newEditor );

		document.querySelector( '.toolbar-container' ).appendChild( newEditor.ui.view.toolbar.element );

		window.editor = newEditor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
