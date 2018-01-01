/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import UndoEngine from '@ckeditor/ckeditor5-undo/src/undoengine';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DeleteCommand integration', () => {
	let editor, model;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ UndoEngine ],
				typing: {
					undoStep: 3
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', command );

				// Mock paragraph feature.
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.extend( 'paragraph', { allowIn: '$block' } );

				model.schema.register( 'img', {
					allowWhere: '$text',
					isObject: true
				} );
				model.schema.extend( '$text', { allowIn: 'img' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	function assertOutput( output ) {
		expect( getData( model ) ).to.equal( output );
	}

	describe( 'with undo', () => {
		it( 'deletes characters (and group changes in batches) and rollbacks', () => {
			setData( model, '<paragraph>123456789[]</paragraph>' );

			for ( let i = 0; i < 3; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<paragraph>123456789[]</paragraph>' );
		} );

		it( 'deletes characters (and group changes in batches) and rollbacks - test step', () => {
			setData( model, '<paragraph>123456789[]</paragraph>' );

			for ( let i = 0; i < 6; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<paragraph>123456[]</paragraph>' );

			editor.execute( 'undo' );

			assertOutput( '<paragraph>123456789[]</paragraph>' );
		} );

		it( 'deletes elements (and group changes in batches) and rollbacks', () => {
			setData( model, '<paragraph><img>1</img><img>2</img><img>3</img><img>4</img><img>5</img><img>6</img>[]</paragraph>' );

			for ( let i = 0; i < 3; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			assertOutput( '<paragraph><img>1</img><img>2</img><img>3</img><img>4</img><img>5</img><img>6</img>[]</paragraph>' );
		} );

		it( 'merges elements (and group changes in batches) and rollbacks', () => {
			setData( model, '<paragraph>123456</paragraph><paragraph>[]78</paragraph>' );

			for ( let i = 0; i < 6; ++i ) {
				editor.execute( 'delete' );
			}

			editor.execute( 'undo' );

			// Deleted 6,5,4, <paragraph> does not count.
			// It's not the most elegant solution, but is the best if we don't want to make complicated algorithm.
			assertOutput( '<paragraph>123[]78</paragraph>' );

			editor.execute( 'undo' );

			// Selection restoing in undo is not 100% correct so slight miss-settings are expected as long as
			// the selection makes any sense and is near the correct position.
			assertOutput( '<paragraph>123456</paragraph><paragraph>78[]</paragraph>' );
		} );

		it( 'merges elements (and group changes in batches) and rollbacks - non-collapsed selection', () => {
			setData( model, '<paragraph>12345[6</paragraph><paragraph>7]8</paragraph>' );

			editor.execute( 'delete' );
			editor.execute( 'delete' );
			editor.execute( 'delete' );

			editor.execute( 'undo' );

			assertOutput( '<paragraph>1234[]8</paragraph>' );

			editor.execute( 'undo' );

			assertOutput( '<paragraph>12345[6</paragraph><paragraph>7]8</paragraph>' );
		} );
	} );

	describe( 'with DataController.deleteContent', () => {
		beforeEach( () => {
			model.schema.register( 'h1', { inheritAllFrom: '$block' } );
		} );

		it( 'should replace content with paragraph - if whole content is selected', () => {
			setData( model, '<h1>[foo</h1><paragraph>bar]</paragraph>' );

			editor.execute( 'delete' );

			assertOutput( '<paragraph>[]</paragraph>' );
		} );

		it( 'should not replace content with paragraph - if not whole content is selected', () => {
			setData( model, '<h1>f[oo</h1><paragraph>bar]</paragraph>' );

			editor.execute( 'delete' );

			assertOutput( '<h1>f[]</h1>' );
		} );

		it( 'should not replace content with paragraph - if selection was collapsed', () => {
			setData( model, '<h1></h1><paragraph>[]</paragraph>' );

			editor.execute( 'delete' );

			assertOutput( '<h1>[]</h1>' );
		} );
	} );
} );
