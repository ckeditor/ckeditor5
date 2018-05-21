/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false, setTimeout */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';

import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

class CustomBlockToolbar extends BlockToolbar {
	init() {
		super.init();

		this.on( 'checkAllowed', ( evt, args ) => {
			const modelElement = args[ 0 ];

			if ( modelElement && modelElement.name === 'heading1' ) {
				evt.return = false;
			}
		} );
	}
}

BalloonEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, HeadingButtonsUI, ParagraphButtonUI, BalloonToolbar, CustomBlockToolbar ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'blockQuote' ]
	} )
	.then( editor => {
		window.editor = editor;

		const externalChanges = createExternalChangesSimulator( editor );

		document.querySelector( '.external-type' ).addEventListener( 'click', () => {
			externalChanges.wait( 4000 )
				.then( () => externalChanges.insertNewLine( [ 1 ] ) )
				.then( () => externalChanges.type( [ 1, 0 ], 'New line' ) )
				.then( () => externalChanges.insertNewLine( [ 2 ] ) )
				.then( () => externalChanges.type( [ 2, 0 ], 'New line' ) )
				.then( () => externalChanges.insertNewLine( [ 3 ] ) )
				.then( () => externalChanges.type( [ 3, 0 ], 'New line' ) );
		} );

		document.querySelector( '.external-delete' ).addEventListener( 'click', () => {
			externalChanges.wait( 4000 )
				.then( () => externalChanges.removeElement( [ 1 ] ) );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Move it to the test utils.
// See https://github.com/ckeditor/ckeditor5-ui/issues/393.
function createExternalChangesSimulator( editor ) {
	const { model } = editor;

	function wait( delay ) {
		return new Promise( resolve => setTimeout( () => resolve(), delay ) );
	}

	function insertNewLine( path ) {
		model.enqueueChange( 'transparent', writer => {
			writer.insertElement( 'paragraph', new Position( model.document.getRoot(), path ) );
		} );

		return Promise.resolve();
	}

	function type( path, text ) {
		return new Promise( resolve => {
			let position = new Position( model.document.getRoot(), path );
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

	function removeElement( path ) {
		model.enqueueChange( 'transparent', writer => {
			writer.remove( Range.createFromPositionAndShift( new Position( model.document.getRoot(), path ), 1 ) );
		} );

		return Promise.resolve();
	}

	return { wait, insertNewLine, type, removeElement };
}
