/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import CKEDITOR from '/ckeditor.js';
import MultiCreator from '/tests/ckeditor5/creator/manual/_utils/creator/multicreator.js';
import testUtils from '/tests/utils/_utils/utils.js';

let editor, editables, observer;

function initEditor() {
	CKEDITOR.create( '.editor', {
		creator: MultiCreator,
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( ( newEditor ) => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` and `editables` variables.' );

		window.editor = editor = newEditor;
		window.editables = editables = editor.editables;

		const editable1 = editables.get( 'editable1' );
		const editable2 = editables.get( 'editable2' );

		editable1.toString = editable2.toString = function() {
			return `Editable(${ this.name })`;
		};

		observer = testUtils.createObserver();
		observer.observe( 'Editable 1', editable1 );
		observer.observe( 'Editable 2', editable2 );
		observer.observe( 'EditableCollection', editables );

		document.getElementById( 'editorContainer' ).appendChild( editor.ui.view.element );
	} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			window.editor = editor = null;
			window.editables = editables = null;

			observer.stopListening();
			observer = null;

			document.getElementById( 'editorContainer' ).innerHTML = '';

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
