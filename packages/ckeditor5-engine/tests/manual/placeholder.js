/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { global } from '@ckeditor/ckeditor5-utils';
import { enableViewPlaceholder } from '../../src/view/placeholder.js';

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

		enableViewPlaceholder( {
			view,
			element: header,
			text: 'Type some header text...'
		} );

		enableViewPlaceholder( {
			view,
			element: paragraph,
			text: 'Type some paragraph text...'
		} );

		view._render();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
