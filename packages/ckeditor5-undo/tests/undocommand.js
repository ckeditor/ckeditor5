/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Position from '/ckeditor5/core/treemodel/position.js';
import Range from '/ckeditor5/core/treemodel/range.js';
import UndoCommand from '/ckeditor5/undo/undocommand.js';

let element, editor, doc, root, undo;

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
	undo = new UndoCommand( editor );

	doc = editor.document;
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

	describe( 'addBatch', () => {
		it( 'should add a batch to command stack', () => {
			const batch = doc.batch();
			undo.addBatch( batch );

			expect( undo._batchStack.length ).to.equal( 1 );
			expect( undo._batchStack[ 0 ] ).to.equal( batch );
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

	describe( '_doExecute', () => {
		const p = pos => new Position( root, [ pos ] );
		const r = ( a, b ) => new Range( p( a ), p( b ) );

		let batch0, batch1, batch2, batch3;

		beforeEach( () => {
			/*
			 [root]
			 */
			batch0 = doc.batch().insert( p( 0 ), 'foobar' );
			/*
			 [root]
			 - f
			 - o
			 - o
			 - b
			 - a
			 - r
			 */
			batch1 = doc.batch().setAttr( 'key', 'value', r( 2, 4 ) );
			/*
			 [root]
			 - f
			 - o
			 - o {key: value}
			 - b {key: value}
			 - a
			 - r
			 */
			batch2 = doc.batch().move( r( 1, 3 ), p( 6 ) );
			/*
			 [root]
			 - f
			 - b {key: value}
			 - a
			 - r
			 - o
			 - o {key: value}
			 */
			batch3 = doc.batch().wrap( r( 1, 4 ), 'p' );
			/*
			 [root]
			 - f
			 - [p]
			 	- b {key: value}
			 	- a
			 	- r
			 - o
			 - o {key: value}
			 */
			batch2.move( r( 0, 1 ), p( 3 ) );
			/*
			 [root]
			 - [p]
			 	- b {key: value}
			 	- a
			 	- r
			 - o
			 - f
			 - o {key: value}
			 */

			undo.addBatch( batch0 );
			undo.addBatch( batch1 );
			undo.addBatch( batch2 );
			undo.addBatch( batch3 );
		} );

		it( 'should revert changes done by deltas from the batch that was most recently added to the command stack', () => {
			undo._doExecute();

			// Wrap is removed:
			/*
				[root]
				- b {key: value}
				- a
				- r
				- o
				- f
				- o {key: value}
			 */

			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'barofo' );
			expect( root.getChild( 0 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 5 ).getAttribute( 'key' ) ).to.equal( 'value' );

			undo._doExecute();

			// Two moves are removed:
			/*
				[root]
				- f
			 	- o
			 	- o {key: value}
				- b {key: value}
				- a
				- r
			 */

			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'foobar' );
			expect( root.getChild( 2 ).getAttribute( 'key' ) ).to.equal( 'value' );
			expect( root.getChild( 3 ).getAttribute( 'key' ) ).to.equal( 'value' );

			undo._doExecute();

			// Set attribute is undone:
			/*
				[root]
				- f
				- o
				- o
				- b
				- a
				- r
			 */

			expect( Array.from( root._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'foobar' );
			expect( root.getChild( 2 ).hasAttribute( 'key' ) ).to.be.false;
			expect( root.getChild( 3 ).hasAttribute( 'key' ) ).to.be.false;

			undo._doExecute();

			// Insert is undone:
			/*
				[root]
			 */

			expect( root.getChildCount() ).to.equal( 0 );
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert set attribute)', () => {
			undo._doExecute( 1 );
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
		} );

		it( 'should revert changes done by deltas from given batch, if parameter was passed (test: revert insert foobar)', () => {
			undo._doExecute( 0 );
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

			undo._doExecute( 0 );
			// Remove attributes.
			// This does nothing in the `root` because attributes were set on nodes that already got removed.
			// But those nodes should change in they graveyard and we can check them there.

			expect( root.getChildCount() ).to.equal( 1 );
			expect( root.getChild( 0 ).name ).to.equal( 'p' );

			expect( doc.graveyard.getChildCount() ).to.equal( 6 );
			// TODO: This one does not work because nodes are moved inside graveyard...
			// TODO: Perfect situation would be if the nodes are moved to graveyard in the order they are in original tree.
			// expect( Array.from( doc.graveyard._children._nodes.map( node => node.text ) ).join( '' ) ).to.equal( 'barofo' );
			for ( let char of doc.graveyard._children ) {
				expect( char.hasAttribute( 'key' ) ).to.be.false;
			}

			// Let's undo wrapping. This should leave us with empty root.
			undo._doExecute( 1 );
			expect( root.getChildCount() ).to.equal( 0 );
		} );

		it( 'should fire undo event with the undone batch', () => {
			const batch = doc.batch();
			const spy = sinon.spy();

			undo.on( 'undo', spy );

			undo._doExecute();

			expect( spy.calledOnce ).to.be.true;
			expect( spy.calledWith( batch ) );
		} );
	} );
} );
