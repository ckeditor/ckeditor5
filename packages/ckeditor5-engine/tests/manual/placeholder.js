/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { enablePlaceholder } from '../../src/view/placeholder.js';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Heading ],
		toolbar: [ 'heading', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		const view = editor.editing.view;
		const viewDoc = view.document;
		const header = viewDoc.getRoot().getChild( 0 );
		const paragraph = viewDoc.getRoot().getChild( 1 );

		enablePlaceholder( {
			view,
			element: header,
			text: 'Type some header text...'
		} );

		enablePlaceholder( {
			view,
			element: paragraph,
			text: 'Type some paragraph text...'
		} );

		view._render();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
