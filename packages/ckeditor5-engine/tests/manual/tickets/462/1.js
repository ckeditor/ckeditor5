/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Bold, Italic ],
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( editor => {
		window.editor = editor;

		setInterval( () => {
			console.clear();

			const domSelection = document.getSelection();
			const selectionExists = domSelection && domSelection.anchorNode;

			console.log( editor.editing.view.getDomRoot().innerHTML.replace( /\u2060/g, '@' ) );
			console.log( 'selection.hasAttribute( italic ):', editor.model.document.selection.hasAttribute( 'italic' ) );
			console.log( 'selection.hasAttribute( bold ):', editor.model.document.selection.hasAttribute( 'bold' ) );
			console.log( 'selection anchor\'s parentNode:', selectionExists ? domSelection.anchorNode.parentNode : 'no DOM selection' );
		}, 2000 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
