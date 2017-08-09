/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { attachPlaceholder } from '../../src/view/placeholder';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading ],
		toolbar: [ 'headings', 'undo', 'redo' ]
	} )
	.then( editor => {
		const viewDoc = editor.editing.view;
		const header = viewDoc.getRoot().getChild( 0 );
		const paragraph = viewDoc.getRoot().getChild( 1 );

		attachPlaceholder( header, 'Type some header text...' );
		attachPlaceholder( paragraph, 'Type some paragraph text...' );
		viewDoc.render();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
