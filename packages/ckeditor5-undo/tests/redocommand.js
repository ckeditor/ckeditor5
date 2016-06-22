/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import Range from '/ckeditor5/engine/model/range.js';
import Position from '/ckeditor5/engine/model/position.js';
import UndoCommand from '/ckeditor5/undo/undocommand.js';
import RedoCommand from '/ckeditor5/undo/redocommand.js';

let editor, doc, root, redo, undo;

beforeEach( () => {
	editor = new ModelTestEditor();
	redo = new RedoCommand( editor );

	doc = editor.document;

	root = doc.getRoot();
} );

afterEach( () => {
	redo.destroy();
} );

describe( 'RedoCommand', () => {
	describe( '_execute', () => {
		const p = pos => new Position( root, [].concat( pos ) );
		const r = ( a, b ) => new Range( p( a ), p( b ) );

		let batch0, batch1, batch2;
		let batches = new Set();

		beforeEach( () => {
			undo = new UndoCommand( editor );

			// Simple integration with undo.
			doc.on( 'change', ( evt, type, data, batch ) => {
				if ( batch.type == 'undo' && !batches.has( batch ) ) {
					redo.addBatch( batch );
					batches.add( batch );
				}
			} );

			/*
			 [root]
			 - {}
			 */
			editor.document.selection.setRanges( [ r( 0, 0 ) ] );
			batch0 = doc.batch();
			undo.addBatch( batch0 );
			batch0.insert( p( 0 ), 'foobar' );
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
			editor.document.selection.setRanges( [ r( 2, 4 ) ], true );
			batch1 = doc.batch();
			undo.addBatch( batch1 );
			batch1.setAttr( 'key', 'value', r( 2, 4 ) );
			/*
			 [root]
			 - f
			 - o
			 - {o (key: value)
			 - b} (key: value)
			 - a
			 - r
			 */
			editor.document.selection.setRanges( [ r( 1, 3 ) ] );
			batch2 = doc.batch();
			undo.addBatch( batch2 );
			batch2.move( r( 1, 3 ), p( 6 ) );
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
			undo._execute( batch2 );

			redo._execute();
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
			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'fbaroo' );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 4, 6 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;
		} );

		it( 'should redo series of batches undone by undo command', () => {
			undo._execute( batch2 );
			undo._execute( batch1 );
			undo._execute( batch0 );

			redo._execute();
			// Should be like after applying `batch0`:
			/*
			 [root]
			 - f
			 - o
			 - {o
			 - b}
			 - a
			 - r
			 */
			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'foobar' );
			expect( root._children._nodes.find( node => node.hasAttribute( 'key' ) ) ).to.be.undefined;

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 2, 4 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.true;

			redo._execute();
			// Should be like after applying `batch1`:
			/*
			 [root]
			 - f
			 - {o
			 - o} (key: value)
			 - b (key: value)
			 - a
			 - r
			 */
			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'foobar' );
			expect( root.getChild( 2 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 3 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 1, 3 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			redo._execute();
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
			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'fbaroo' );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 4, 6 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;
		} );

		it( 'should redo batch selectively undone by undo command', () => {
			undo._execute( batch0 );
			redo._execute();

			// Should be back to original state:
			/*
			 [root]
			 - f
			 - b (key: value)
			 - a
			 - r
			 - {o
			 - o} (key: value)
			 */
			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'fbaroo' );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 4, 6 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;
		} );

		it( 'should transform redo batch by changes written in history that happened after undo but before redo', () => {
			// Undo moving "oo" to the end of string. Now it is "foobar".
			undo._execute( batch2 );

			// Remove "ar".
			editor.document.selection.setRanges( [ r( 4, 6 ) ] );
			doc.batch().remove( r( 4, 6 ) );
			editor.document.selection.setRanges( [ r( 4, 4 ) ] );

			// Redo moving "oo" to the end of string. It should be "fboo".
			redo._execute();

			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'fboo' );
			expect( root.getChild( 1 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 3 ).getAttribute( 'key' ) ).to.equal( 'value' );

			// Selection after redo is not working properly if there was another batch in-between.
			// Thankfully this will be very rare situation outside of OT, because normally an applied batch
			// would reset the redo stack so you won't be able to redo. #12
		} );
	} );
} );
