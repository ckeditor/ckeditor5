/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

'use strict';

import CKEDITOR from '/ckeditor.js';
import InlineCreator from '/tests/core/creator/manual/_utils/creator/inlinecreator.js';
import testUtils from '/tests/utils/_utils/utils.js';

let editor, observer;

function initEditor() {
	CKEDITOR.create( '#editor', {
		creator: InlineCreator,
		toolbar: [ 'bold', 'italic' ]
	} )
	.then( ( newEditor ) => {
		console.log( 'Editor was initialized', newEditor );
		console.log( 'You can now play with it using global `editor` variable.' );

		window.editor = editor = newEditor;

		observer = testUtils.createObserver();
		observer.observe( 'Editable', editor.editable );
	} );
}

function destroyEditor() {
	editor.destroy()
		.then( () => {
			window.editor = null;
			editor = null;

			observer.stopListening();
			observer = null;

			console.log( 'Editor was destroyed' );
		} );
}

document.getElementById( 'initEditor' ).addEventListener( 'click', initEditor );
document.getElementById( 'destroyEditor' ).addEventListener( 'click', destroyEditor );
