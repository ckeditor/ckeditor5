/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch.js';
import UndoCommand from '../src/undocommand.js';
import RedoCommand from '../src/redocommand.js';
import { itemAt, getText } from '@ckeditor/ckeditor5-engine/tests/model/_utils/utils.js';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray.js';

describe( 'RedoCommand', () => {
	let editor, model, root, redo, undo;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;

			redo = new RedoCommand( editor );
			model = editor.model;
			root = model.document.getRoot();
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'RedoCommand', () => {
		describe( 'execute()', () => {
			const p = pos => model.createPositionFromPath( root, toArray( pos ) );
			const r = ( a, b ) => model.createRange( p( a ), p( b ) );

			let batch0, batch1, batch2;
			const batches = new Set();

			beforeEach( () => {
				undo = new UndoCommand( editor );

				// Simple integration with undo.
				undo.on( 'revert', ( evt, undoneBatch, undoingBatch ) => {
					if ( !batches.has( undoingBatch ) ) {
						redo.addBatch( undoingBatch );
						batches.add( undoingBatch );
					}
				} );

				/*
				 [root]
				 - {}
				 */
				model.change( writer => {
					writer.setSelection( r( 0, 0 ) );
				} );

				batch0 = model.createBatch();
				undo.addBatch( batch0 );
				model.enqueueChange( batch0, writer => {
					writer.insertText( 'foobar', p( 0 ) );
				} );

				/*
				 [root]
				 - f
				 - o
				 - o
				 - b
				 - a
				 - r{}
				 */
				// Let's make things spicy and this time, make a backward selection.
				model.change( writer => {
					writer.setSelection( r( 2, 4 ), { backward: true } );
				} );
				batch1 = model.createBatch();
				undo.addBatch( batch1 );
				model.enqueueChange( batch1, writer => {
					writer.setAttribute( 'key', 'value', r( 2, 4 ) );
				} );

				/*
				 [root]
				 - f
				 - o
				 - {o (key: value)
				 - b} (key: value)
				 - a
				 - r
				 */
				model.change( writer => {
					writer.setSelection( r( 1, 3 ) );
				} );
				batch2 = model.createBatch();
				undo.addBatch( batch2 );
				model.enqueueChange( batch2, writer => {
					writer.move( r( 1, 3 ), p( 6 ) );
				} );

				/*
				 [root]
				 - f
				 - b (key: value)
				 - a
				 - r
				 - {o
				 - o} (key: value)
				 */
			} );

			it( 'should redo batch undone by undo command', () => {
				undo.execute( batch2 );

				redo.execute();
				// Should be back at original state:
				/*
				 [root]
				 - f
				 - b (key: value)
				 - a
				 - r
				 - {o
				 - o} (key: value)
				 */
				expect( getText( root ) ).to.equal( 'fbaroo' );
				expect( itemAt( root, 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 4, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.false;
			} );

			it( 'should redo series of batches undone by undo command', () => {
				undo.execute();
				undo.execute();
				undo.execute();

				redo.execute();
				// Should be like after applying `batch0`:
				/*
				 [root]
				 - f
				 - o
				 - o
				 - b
				 - a
				 - r{}
				 */
				expect( getText( root ) ).to.equal( 'foobar' );
				expect( Array.from( root.getChildren() ).find( node => node.hasAttribute( 'key' ) ) ).to.be.undefined;

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 6, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.false;

				redo.execute();
				// Should be like after applying `batch1`:
				/*
				 [root]
				 - f
				 - o
				 - {o (key: value)
				 - b} (key: value)
				 - a
				 - r
				 */
				expect( getText( root ) ).to.equal( 'foobar' );
				expect( itemAt( root, 2 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 3 ).getAttribute( 'key' ) ).to.equal( 'value' );

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 2, 4 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.true;

				redo.execute();
				// Should be like after applying `batch2`:
				/*
				 [root]
				 - f
				 - b (key: value)
				 - a
				 - r
				 - {o
				 - o} (key: value)
				 */
				expect( getText( root ) ).to.equal( 'fbaroo' );
				expect( itemAt( root, 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 4, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.false;
			} );

			it( 'should redo batch selectively undone by undo command', () => {
				undo.execute( batch0 );
				redo.execute();

				// Should be back to original state:
				/*
				 [root]
				 - f
				 - b (key: value)
				 - a
				 - r
				 - o
				 - o{} (key: value)
				 */
				expect( getText( root ) ).to.equal( 'fbaroo' );
				expect( itemAt( root, 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 6, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.false;
			} );

			it( 'should redo batch selectively undone by undo command #2', () => {
				undo.execute( batch1 );
				undo.execute( batch2 );
				redo.execute();
				redo.execute();

				// Should be back to original state:
				/*
				 [root]
				 - f
				 - {b} (key: value)
				 - a
				 - r
				 - o
				 - o (key: value)
				 */
				expect( getText( root ) ).to.equal( 'fbaroo' );
				expect( itemAt( root, 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

				expect( editor.model.document.selection.getRanges().next().value.isEqual( r( 1, 2 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.true;
			} );

			it( 'should transform redo batch by changes written in history that happened after undo but before redo #2', () => {
				// Now it is "fBaroO".
				// Undo moving "oo" to the end of string. Now it is "foOBar". Capitals mean set attribute.
				undo.execute();

				// Remove "ar".
				model.change( writer => {
					writer.remove( r( 4, 6 ) );
				} );

				// Undo setting attribute on "ob". Now it is "foob".
				undo.execute();

				// Append "xx" at the beginning. Now it is "xxfoob".
				model.change( writer => {
					writer.insertText( 'xx', p( 0 ) );
				} );

				// Redo setting attribute on "ob". Now it is "xxfoOB".
				redo.execute();

				expect( getText( root ) ).to.equal( 'xxfoob' );
				expect( itemAt( root, 4 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( editor.model.document.selection.getFirstRange().isEqual( r( 4, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.true;

				// Redo moving "oo". Now it is "xxfBoO". Selection is expected to be on just moved "oO".
				redo.execute();

				expect( getText( root ) ).to.equal( 'xxfboo' );
				expect( itemAt( root, 3 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( itemAt( root, 5 ).getAttribute( 'key' ) ).to.equal( 'value' );
				expect( editor.model.document.selection.getFirstRange().isEqual( r( 4, 6 ) ) ).to.be.true;
				expect( editor.model.document.selection.isBackward ).to.be.false;
			} );

			it( 'should pass redoing batch to enqueueChange method', () => {
				undo.execute( batch2 );

				const enqueueChangeSpy = sinon.spy( model, 'enqueueChange' );
				const undoSpy = sinon.spy( redo, '_undo' );

				redo.execute();

				sinon.assert.calledOnce( enqueueChangeSpy );
				sinon.assert.calledOnce( undoSpy );

				const redoingBatch = enqueueChangeSpy.firstCall.args[ 0 ];

				expect( redoingBatch instanceof Batch ).to.be.true;
				expect( undoSpy.firstCall.args[ 1 ] ).to.equal( redoingBatch );
			} );
		} );

		it( 'should clear stack on DataController set()', () => {
			const spy = sinon.stub( redo, 'clearStack' );

			editor.setData( 'foo' );

			sinon.assert.called( spy );
		} );

		it( 'should clear stack on DataController set() when the batch is set as not undoable', () => {
			const spy = sinon.stub( redo, 'clearStack' );

			editor.data.set( 'foo', { batchType: { isUndoable: false } } );

			sinon.assert.called( spy );
		} );

		it( 'should not clear stack on DataController#set() when the batch is set as undoable', () => {
			const spy = sinon.spy( redo, 'clearStack' );

			editor.data.set( 'foo', { batchType: { isUndoable: true } } );

			sinon.assert.notCalled( spy );
		} );

		it( 'should override the batch type when the batch type is not set', () => {
			const dataSetSpy = sinon.spy();

			editor.data.on( 'set', dataSetSpy, { priority: 'lowest' } );

			editor.data.set( 'foo' );

			const firstCall = dataSetSpy.firstCall;
			const data = firstCall.args[ 1 ];

			expect( data[ 1 ] ).to.be.an( 'object' );
			expect( data[ 1 ].batchType ).to.deep.equal( { isUndoable: false } );
		} );

		it( 'should not override the batch type in editor.data.set() when the batch type is set', () => {
			const dataSetSpy = sinon.spy();

			editor.data.on( 'set', dataSetSpy, { priority: 'lowest' } );

			editor.data.set( 'foo', { batchType: { isUndoable: true } } );

			const firstCall = dataSetSpy.firstCall;
			const data = firstCall.args[ 1 ];

			expect( data[ 1 ] ).to.be.an( 'object' );
			expect( data[ 1 ].batchType ).to.deep.equal( { isUndoable: true } );
		} );
	} );
} );
