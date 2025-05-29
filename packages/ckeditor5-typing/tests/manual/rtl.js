/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

const config = {
	plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
	toolbar: [ 'heading', '|', 'bold', 'italic', 'undo', 'redo' ]
};

window.setInterval( function() {
	const doc1 = window.editor1.model.document;
	const doc2 = window.editor2.model.document;

	if ( window.editor1.editing.view.document.isFocused ) {
		console.log( 'editor 1', getData( window.editor1.model ) );

		const modelSel = doc1.selection;

		console.log(
			'editor 1 – model selection',
			'anchor: ' + modelSel.anchor.offset,
			'focus: ' + modelSel.focus.offset,
			'backward: ' + modelSel.isBackward
		);

		const nativeSel = document.getSelection();

		console.log(
			'editor 1 – native selection',
			'anchor: ', nativeSel.anchorNode, nativeSel.anchorOffset,
			'focus: ', nativeSel.focusNode, nativeSel.focusOffset
		);
	}

	if ( window.editor2.editing.view.document.isFocused ) {
		console.log( 'editor 2', getData( window.editor2.model ) );

		const modelSel = doc2.selection;

		console.log(
			'editor 2 – model selection',
			'anchor: ' + modelSel.anchor.offset,
			'focus: ' + modelSel.focus.offset,
			'backward: ' + modelSel.isBackward
		);

		const nativeSel = document.getSelection();

		console.log(
			'editor 2 – native selection',
			'anchor: ', nativeSel.anchorNode, nativeSel.anchorOffset,
			'focus: ', nativeSel.focusNode, nativeSel.focusOffset
		);
	}

	if ( document.activeElement == document.getElementById( 'native1' ) ) {
		const nativeSel = document.getSelection();

		console.log(
			'native 1 – native selection',
			'anchor: ', nativeSel.anchorNode, nativeSel.anchorOffset,
			'focus: ', nativeSel.focusNode, nativeSel.focusOffset
		);
	}

	if ( document.activeElement == document.getElementById( 'native2' ) ) {
		const nativeSel = document.getSelection();

		console.log(
			'native 2 – native selection',
			'anchor: ', nativeSel.anchorNode, nativeSel.anchorOffset,
			'focus: ', nativeSel.focusNode, nativeSel.focusOffset
		);
	}
}, 3000 );

ClassicEditor
	.create( document.querySelector( '#editor1' ), config )
	.then( editor => {
		window.editor1 = editor;

		// Editable doesn't automatically get this attribute right now.
		// https://github.com/ckeditor/ckeditor5-editor-classic/issues/32
		editor.editing.view.getDomRoot().setAttribute( 'dir', 'rtl' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor2' ), config )
	.then( editor => {
		window.editor2 = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
