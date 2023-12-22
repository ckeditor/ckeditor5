/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, window, CKEditorInspector */

import MultiRootEditor from '../../src/multirooteditor.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import { InlineToolbar } from '@ckeditor/ckeditor5-ui';

function createEditor( name, playgroundContainer, rootsToolbarsConfig, onInit ) {
	let editor;

	const editorData = {
		short: playgroundContainer.querySelector( '.short-toolbar' ),
		long: playgroundContainer.querySelector( '.long-toolbar' ),
		generic: playgroundContainer.querySelector( '.generic-toolbar' )
	};

	function initEditor() {
		MultiRootEditor
			.create( editorData, {
				plugins: [ Essentials, Paragraph, Heading, Bold, Italic, InlineToolbar ],
				toolbar: [ 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic' ],
				rootsToolbars: rootsToolbarsConfig
			} )
			.then( newEditor => {
				console.log( `Editor "${ name }" was initialized`, newEditor );

				window[ name ] = editor = newEditor;
				window[ `${ name }-editables` ] = newEditor.ui.view.editables;

				onInit && onInit( newEditor );

				CKEditorInspector.attach( {
					[ name ]: newEditor
				} );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}

	async function destroyEditor() {
		await editor.destroy();

		editor.ui.view.toolbar.element.remove();

		window.editor = editor = null;
		window.editables = null;

		console.log( `Editor "${ name }" was destroyed` );
	}

	const initButton = document.createElement( 'button' );
	initButton.textContent = 'Init editor';
	initButton.addEventListener( 'click', initEditor );

	const destroyButton = document.createElement( 'button' );
	destroyButton.textContent = 'Destroy editor';
	destroyButton.addEventListener( 'click', destroyEditor );

	playgroundContainer.prepend( initButton );
	playgroundContainer.prepend( destroyButton );

	initEditor();
}

createEditor( 'known-roots', document.querySelector( '#editor-known-roots' ), {
	short: [ 'undo', 'redo', '|', 'bold', 'italic' ],
	long: [ 'undo', 'redo', '|', ...new Array( 40 ).fill( 'bold' ) ]
} );

createEditor( 'known-and-dynamic-roots', document.querySelector( '#known-and-dynamic' ), rootName => {
	if ( rootName === 'short' ) {
		return [ 'undo', 'redo', '|', 'bold', 'italic' ];
	} else if ( rootName === 'long' ) {
		return [ 'undo', 'redo', '|', ...new Array( 40 ).fill( 'bold' ) ];
	} else if ( rootName.startsWith( 'dynamic' ) ) {
		return [ 'undo', 'redo' ];
	}
}, newEditor => {
	const addRootButton = document.createElement( 'button' );
	addRootButton.textContent = 'Add dynamic root';

	addRootButton.addEventListener( 'click', () => {
		const uid = 'dynamic' + ( String( new Date().getTime() ) ).slice( -5 );

		newEditor.addRoot( 'dynamic' + uid, {
			isUndoable: true,
			data: `<p>This root ("${ uid }") uses a dedicated toolbar for all dynamic roots.</p>`
		} );
	} );

	newEditor.on( 'addRoot', ( evt, root ) => {
		const domElement = newEditor.createEditable( root );

		document.querySelector( '#known-and-dynamic .editable-container' ).appendChild( domElement );
	} );

	document.querySelector( '#known-and-dynamic > button:last-of-type' ).after( addRootButton );
} );

