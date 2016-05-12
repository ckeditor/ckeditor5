/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import CKEDITOR from '/ckeditor.js';
import LegacyCreator from '/tests/ckeditor5/creator/manual/_utils/creator/legacycreator.js';
import testUtils from '/tests/utils/_utils/utils.js';

let editor, editable, observer;

function initEditor() {
	CKEDITOR.create( '#editor', {
		creator: LegacyCreator,
		ui: {
			width: 400,
			height: 400
		},
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( ( newEditor ) => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` and `editable` variables.' );

		window.editor = editor = newEditor;
		window.editable = editable = editor.editables.get( 0 );

		console.log( window.editor, editor );

		observer = testUtils.createObserver();
		observer.observe( 'Editable', editable );
	} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			window.editor = editor = null;
			window.editable = editable = null;

			observer.stopListening();
			observer = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
