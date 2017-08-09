/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import EssentialsPreset from '@ckeditor/ckeditor5-presets/src/essentials';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

const config = {
	plugins: [ EssentialsPreset, Paragraph, Bold, Italic, Heading ],
	toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo' ]
};

window.setInterval( function() {
	const doc1 = window.editor1.document;
	const doc2 = window.editor2.document;

	if ( window.editor1.editing.view.isFocused ) {
		console.log( 'editor 1', getData( doc1 ) );

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

	if ( window.editor2.editing.view.isFocused ) {
		console.log( 'editor 2', getData( doc2 ) );

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
