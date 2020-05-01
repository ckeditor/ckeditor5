/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false, setTimeout */

import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import List from '@ckeditor/ckeditor5-list/src/list';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import BlockToolbar from '../../../src/toolbar/block/blocktoolbar';

BalloonEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, List, Paragraph, Heading, Image, ImageCaption, HeadingButtonsUI, ParagraphButtonUI, BlockToolbar ],
		blockToolbar: [
			'paragraph', 'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph',
			'heading1', 'heading2', 'heading3', 'bulletedList', 'numberedList', 'paragraph', 'heading1', 'heading2', 'heading3',
			'bulletedList', 'numberedList'
		]
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
			writer.insertElement( 'paragraph', writer.createPositionFromPath( model.document.getRoot(), path ) );
		} );

		return Promise.resolve();
	}

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

	function removeElement( path ) {
		model.enqueueChange( 'transparent', writer => {
			const start = writer.createPositionFromPath( model.document.getRoot(), path );

			writer.remove( writer.createRange( start, start.getShiftedBy( 1 ) ) );
		} );

		return Promise.resolve();
	}

	return { wait, insertNewLine, type, removeElement };
}
