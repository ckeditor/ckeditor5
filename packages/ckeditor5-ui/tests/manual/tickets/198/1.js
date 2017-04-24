/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePresets from '@ckeditor/ckeditor5-presets/src/article';
import ContextualToolbar from '../../../../src/toolbar/contextual/contextualtoolbar';

import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import Text from '@ckeditor/ckeditor5-engine/src/model/text';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';

// Editor for the ContextualToolbar plugin.
ClassicEditor.create( document.querySelector( '#editor-ct' ), {
	plugins: [ ArticlePresets, ContextualToolbar ],
	toolbar: [ 'undo', 'redo' ],
	contextualToolbar: [ 'bold', 'italic' ]
} )
.then( editor => initExternalChangesHandler( editor, document.querySelector( '#button-ct' ) ) )
.catch( err => console.error( err.stack ) );

// Editor for the Link plugin.
ClassicEditor.create( document.querySelector( '#editor-link' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'undo', 'redo', 'link' ],
	contextualToolbar: [ 'bold', 'italic' ]
} )
.then( editor => initExternalChangesHandler( editor, document.querySelector( '#button-link' ) ) )
.catch( err => console.error( err.stack ) );

// Editor for the Link plugin.
ClassicEditor.create( document.querySelector( '#editor-image-toolbar' ), {
	plugins: [ ArticlePresets ],
	toolbar: [ 'undo', 'redo' ],
	contextualToolbar: [ 'bold', 'italic' ]
} )
.then( editor => initExternalChangesHandler( editor, document.querySelector( '#button-image-toolbar' ) ) )
.catch( err => console.error( err.stack ) );

// Handles button click and starts external changes for the specified editor.
function initExternalChangesHandler( editor, element ) {
	element.addEventListener( 'click', () => {
		element.disabled = true;
		startExternalChanges( editor ).then( () => element.disabled = false );
	} );
}

function startExternalChanges( editor ) {
	const document = editor.document;
	const bath = document.batch( 'transparent' );

	function type( path, text ) {
		return new Promise( ( resolve ) => {
			let position = new Position( document.getRoot(), path );
			let index = 0;

			function typing() {
				setTimeout( () => {
					document.enqueueChanges( () => {
						bath.insert( position, new Text( text[ index ] ) );
						position = position.getShiftedBy( 1 );

						let nextLetter = text[ ++index ];

						if ( nextLetter ) {
							typing( nextLetter );
						} else {
							index = 0;
							resolve();
						}
					} );
				}, 40 );
			}

			typing();
		} );
	}

	function insertNewLine( path ) {
		return new Promise( ( resolve ) => {
			setTimeout( () => {
				document.enqueueChanges( () => {
					bath.insert( new Position( document.getRoot(), path  ), new Element( 'paragraph' ) );
					resolve();
				} );
			}, 200 );
		} );
	}

	function wait( delay ) {
		return new Promise( ( resolve ) => {
			setTimeout( () => resolve(), delay );
		} );
	}

	return wait( 3000 )
		.then( () => type( [ 0, 36 ], `It's a hug, Michael. I'm hugging you. Guy's a pro. There's only one man I've ever called a coward` ) )
		.then( () => insertNewLine( [ 0 ] ) )
		.then( () => type( [ 0, 0 ], 'a' ) )
		.then( () => insertNewLine( [ 1 ] ) )
		.then( () => type( [ 1, 0 ], 'b' ) )
		.then( () => insertNewLine( [ 2 ] ) )
		.then( () => type( [ 2, 0 ], 'c' ) )
		.then( () => insertNewLine( [ 0 ] ) )
		.then( () => type( [ 0, 0 ], 'EXTERNAL CHANGES WILL START FROM HERE -> ' ) );
}
