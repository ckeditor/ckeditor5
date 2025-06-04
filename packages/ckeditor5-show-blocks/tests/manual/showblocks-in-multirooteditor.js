/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ShowBlocks from '../../src/showblocks.js';

import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';

const editorData = {
	intro: document.querySelector( '#editor-intro' ),
	content: document.querySelector( '#editor-content' ),
	outro: document.querySelector( '#editor-outro' )
};

MultiRootEditor
	.create( editorData, {
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
