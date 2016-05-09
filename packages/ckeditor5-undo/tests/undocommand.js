/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import ModelDocument from '/ckeditor5/engine/treemodel/document.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import UndoCommand from '/ckeditor5/undo/undocommand.js';

let element, editor, doc, root, undo;

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
	undo = new UndoCommand( editor );

	doc = new ModelDocument();
	editor.document = doc;

	root = doc.createRoot( 'root' );
} );

afterEach( () => {
	undo.destroy();
} );

describe( 'UndoCommand', () => {
	describe( 'constructor', () => {
		it( 'should create undo command with empty batch stack', () => {
			expect( undo._batchStack.length ).to.equal( 0 );
		} );
	} );

	describe( 'clearStack', () => {
		it( 'should remove all batches from the stack', () => {
			undo.addBatch( doc.batch() );
			undo.clearStack();

			expect( undo._batchStack.length ).to.equal( 0 );
		} );
	} );

	describe( '_checkEnabled', () => {
		it( 'should return false if there are no batches in command stack', () => {
			expect( undo._checkEnabled() ).to.be.false;
		} );

		it( 'should return true if there are batches in command stack', () => {
			undo.addBatch( doc.batch() );

			expect( undo._checkEnabled() ).to.be.true;
		} );
	} );

	describe( '_execute', () => {
		const p = pos => new Position( root, [].concat( pos ) );
		const r = ( a, b ) => new Range( p( a ), p( b ) );

		let batch0, batch1, batch2, batch3;

		beforeEach( () => {
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
			editor.document.selection.setRanges( [ r( 1, 4 ) ] );
			batch3 = doc.batch();
			undo.addBatch( batch3 );
			batch3.wrap( r( 1, 4 ), 'p' );
			/*
			 [root]
			 - f
			 - [p]
			 	- {b (key: value)
			 	- a
			 	- r}
			 - o
			 - o (key: value)
			 */
			editor.document.selection.setRanges( [ r( 0, 1 ) ] );
			batch2.move( r( 0, 1 ), p( 3 ) );
			/*
			 [root]
			 - [p]
			 	- b (key: value)
			 	- a
			 	- r
			 - o
			 - f
			 - o{} (key: value)
			 */
			editor.document.selection.setRanges( [ r( 4, 4 ) ] );
		} );

		it( 'should revert changes done by deltas from the batch that was most recently added to the command stack', () => {
			undo._execute();

			// Selection is restored. Wrap is removed:
			/*
				[root]
				- {b (key: value)
				- a
				- r}
				- o
				- f
				- o (key: value)
			 */

			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'barofo' );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 3 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			undo._execute();

			// Two moves are removed:
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

			undo._execute();

			// Set attribute is undone:
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
			expect( root.getChild( 2 ).hasAttribute( 'key' ) ).to.be.false;
			expect( root.getChild( 3 ).hasAttribute( 'key' ) ).to.be.false;

			expect( editor.document.selection.getRanges().next().value.isEqual( r( 2, 4 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.true;

			undo._execute();

			// Insert is undone:
			/*
				[root]
			 */

			expect( root.getChildCount() ).to.equal( 0 );
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert set attribute)', () => {
			// editor.document.selection.setRanges( [ r( [ 0, 1 ], [ 0, 2 ] ) ] );

			undo._execute( 1 );
			// Remove attribute:
			/*
				[root]
				- [p]
					- b
					- a
					- r
				- o
				- f
				- o
			 */

			expect( root.getChild( 0 ).name ).to.equal( 'p' );
			expect( Array.from( root.getChild( 0 )._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'bar' );
			expect( root.getChild( 0 ).getChild( 0 ).hasAttribute( 'key' ) ).to.be.false;
			expect( root.getChild( 2 ).hasAttribute( 'key' ) ).to.be.false;
			expect( root.getChild( 3 ).hasAttribute( 'key' ) ).to.be.false;

			// Selection is only partially restored because the range got broken.
			// The selection would have to best on letter "b" and letter "o", but it is set only on letter "b".
			expect( editor.document.selection.getRanges().next().value.isEqual( r( [ 0, 0 ], [ 0, 1 ] ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.true;
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert insert foobar)', () => {
			undo._execute( 0 );
			// Remove foobar:
			/*
			 [root]
			 - [p]
			 */

			// The `P` element wasn't removed because it wasn`t added by undone batch.
			// It would be perfect if the `P` got removed aswell because wrapping was on removed nodes.
			// But this would need a lot of logic / hardcoded ifs or a post-fixer.
			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );

			// Because P element was inserted in the middle of removed text and it was not removed,
			// the selection is set after it.
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 1, 1 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			undo._execute( 0 );
			// Remove attributes.
			// This does nothing in the `root` because attributes were set on nodes that already got removed.
			// But those nodes should change in they graveyard and we can check them there.

			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );

			// Operations for undoing that batch were working on graveyard so document selection should not change.
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 1, 1 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;

			expect( doc.graveyard.getChildCount() ).to.equal( 6 );

			for ( let char of doc.graveyard._children ) {
				expect( char.hasAttribute( 'key' ) ).to.be.false;
			}

			// Let's undo wrapping. This should leave us with empty root.
			undo._execute( 1 );
			expect( root.getChildCount() ).to.equal( 0 );

			// Once again transformed range ends up in the graveyard.
			// So we do not restore it. But since Selection is a LiveRange itself it will update
			// because the node before it (P element) got removed.
			expect( editor.document.selection.getRanges().next().value.isEqual( r( 0, 0 ) ) ).to.be.true;
			expect( editor.document.selection.isBackward ).to.be.false;
		} );

		it( 'should fire undo event with the undone batch', () => {
			const batch = doc.batch();
			const spy = sinon.spy();

			undo.on( 'revert', spy );

			undo._execute();

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWith( batch ) );
		} );
	} );
} );
