/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import UndoEngine from '@ckeditor/ckeditor5-undo/src/undoengine';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DeleteCommand integration', () => {
	let editor, doc;

	beforeEach( () => {
		return ModelTestEditor.create( {
				plugins: [
					UndoEngine
				],
				typing: {
					undoStep: 3
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.set( 'delete', command );

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'img', '$inline' );
				doc.schema.allow( { name: '$text', inside: 'img' } );

				doc.schema.objects.add( 'img' );
			} );
	} );

	function assertOutput( output ) {
		expect( getData( doc ) ).to.equal( output );
	}

	describe( 'DeleteCommand integration', () => {
		it( 'deletes characters (and group changes in batches) and rollbacks', () => {
			setData( doc, '<p>123456789[]</p>' );

			for ( let i = 0; i < 3; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<p>123456789[]</p>' );
		} );

		it( 'deletes characters (and group changes in batches) and rollbacks - test step', () => {
			setData( doc, '<p>123456789[]</p>' );

			for ( let i = 0; i < 6; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<p>123456[]</p>' );

			editor.execute( 'undo' );

			assertOutput( '<p>123456789[]</p>' );
		} );

		it( 'deletes elements (and group changes in batches) and rollbacks', () => {
			setData( doc, '<p><img>1</img><img>2</img><img>3</img><img>4</img><img>5</img><img>6</img>[]</p>' );

			for ( let i = 0; i < 3; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<p><img>1</img><img>2</img><img>3</img><img>4</img><img>5</img><img>6</img>[]</p>' );
		} );

		it( 'merges elements (and group changes in batches) and rollbacks', () => {
			setData( doc, '<p>123456</p><p>[]78</p>' );

			for ( let i = 0; i < 6; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			// Deleted 6,5,4, <P> does not count.
			// It's not the most elegant solution, but is the best if we don't want to make complicated algorithm.
			assertOutput( '<p>123[]78</p>' );

			editor.execute( 'undo' );

			assertOutput( '<p>123456</p><p>[]78</p>' );
		} );

		it( 'merges elements (and group changes in batches) and rollbacks - non-collapsed selection', () => {
			setData( doc, '<p>12345[6</p><p>7]8</p>' );

			editor.execute( 'delete' );
			editor.execute( 'delete' );
			editor.execute( 'delete' );

			editor.execute( 'undo' );

			assertOutput( '<p>1234[]8</p>' );

			editor.execute( 'undo' );

			assertOutput( '<p>12345[6</p><p>7]8</p>' );
		} );
	} );
} );
