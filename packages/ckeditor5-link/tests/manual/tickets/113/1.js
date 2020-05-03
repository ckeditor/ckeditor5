/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, document, setTimeout */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

// Editor for the external insert.
ClassicEditor
	.create( document.querySelector( '#editor-insert' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'undo', 'redo', 'link' ]
	} )
	.then( editor => {
		const element = document.querySelector( '#button-insert' );

		element.addEventListener( 'click', () => {
			element.disabled = true;
			startExternalInsert( editor );
		} );
	} )
	.catch( err => console.error( err.stack ) );

// Editor for the external delete.
ClassicEditor
	.create( document.querySelector( '#editor-delete' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'undo', 'redo', 'link' ]
	} )
	.then( editor => {
		const element = document.querySelector( '#button-delete' );

		element.addEventListener( 'click', () => {
			element.disabled = true;
			startExternalDelete( editor );
		} );
	} )
	.catch( err => console.error( err.stack ) );

function wait( delay ) {
	return new Promise( resolve => {
		setTimeout( () => resolve(), delay );
	} );
}

function startExternalInsert( editor ) {
	const model = editor.model;

	function type( path, text ) {
		return new Promise( resolve => {
			let position = model.createPositionFromPath( model.document.getRoot(), path );
			let index = 0;

			function typing() {
				wait( 40 ).then( () => {
					model.enqueueChange( 'transparent', writer => {
						writer.insertText( text[ index ], position );
						position = position.getShiftedBy( 1 );

						const nextLetter = text[ ++index ];

						if ( nextLetter ) {
							typing( nextLetter );
						} else {
							index = 0;
							resolve();
						}
					} );
				} );
			}

			typing();
		} );
	}

	function insertNewLine( path ) {
		return wait( 200 ).then( () => {
			model.enqueueChange( 'transparent', writer => {
				writer.insertElement( 'paragraph', writer.createPositionFromPath( model.document.getRoot(), path ) );
			} );

			return Promise.resolve();
		} );
	}

	wait( 3000 )
		.then( () => type( [ 0, 36 ], 'This specification defines the 5th major revision of the core language of the World Wide Web. ' ) )
		.then( () => insertNewLine( [ 0 ] ) )
		.then( () => type( [ 0, 0 ], 'a' ) )
		.then( () => insertNewLine( [ 1 ] ) )
		.then( () => type( [ 1, 0 ], 'b' ) )
		.then( () => insertNewLine( [ 2 ] ) )
		.then( () => type( [ 2, 0 ], 'c' ) )
		.then( () => insertNewLine( [ 0 ] ) )
		.then( () => type( [ 0, 0 ], 'DONE :)' ) );
}

function startExternalDelete( editor ) {
	const model = editor.model;

	wait( 3000 ).then( () => {
		model.enqueueChange( 'transparent', writer => {
			const start = writer.createPositionFromPath( model.document.getRoot(), [ 1 ] );
			writer.remove( writer.createRange( start, start.getShiftedBy( 1 ) ) );
		} );
	} );
}
