/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, delta */

'use strict';

import { getNodesAndText } from '/tests/engine/treemodel/_utils/utils.js';
import Document from '/ckeditor5/engine/treemodel/document.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Range from '/ckeditor5/engine/treemodel/range.js';
import Element from '/ckeditor5/engine/treemodel/element.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

import MoveDelta from '/ckeditor5/engine/treemodel/delta/movedelta.js';
import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';

describe( 'Batch', () => {
	let doc, root, div, p, batch, chain;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );

		div = new Element( 'div', [], 'foobar' );
		p = new Element( 'p', [], 'abcxyz' );

		div.insertChildren( 4, [ new Element( 'p', [], 'gggg' ) ] );
		div.insertChildren( 2, [ new Element( 'p', [], 'hhhh' ) ] );

		root.insertChildren( 0, [ div, p ] );

		batch = doc.batch();
	} );

	describe( 'move', () => {
		it( 'should move specified node', () => {
			batch.move( div, new Position( root, [ 2 ] ) );

			expect( root.getChildCount() ).to.equal( 2 );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 1 ) ) ) ).to.equal( 'foPhhhhPobPggggPar' );
		} );

		it( 'should move flat range of nodes', () => {
			let range = new Range( new Position( root, [ 0, 3 ] ), new Position( root, [ 0, 7 ] ) );
			batch.move( range, new Position( root, [ 1, 3 ] ) );

			expect( getNodesAndText( Range.createFromElement( root.getChild( 0 ) ) ) ).to.equal( 'foPhhhhPr' );
			expect( getNodesAndText( Range.createFromElement( root.getChild( 1 ) ) ) ).to.equal( 'abcobPggggPaxyz' );
		} );

		it( 'should throw if given range is not flat', () => {
			let notFlatRange = new Range( new Position( root, [ 0, 2, 2 ] ), new Position( root, [ 0, 6 ] ) );

			expect( () => {
				doc.batch().move( notFlatRange, new Position( root, [ 1, 3 ] ) );
			} ).to.throw( CKEditorError, /^batch-move-range-not-flat/ );
		} );

		it( 'should be chainable', () => {
			chain = batch.move( div, new Position( root, [ 1, 3 ] ) );

			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.move( div, new Position( root, [ 2 ] ) );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'MoveDelta', () => {
	let moveDelta, doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		moveDelta = new MoveDelta();
	} );

	describe( 'constructor', () => {
		it( 'should create move delta with no operations added', () => {
			expect( moveDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'sourcePosition', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.sourcePosition ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.sourcePosition.root ).to.equal( root );
			expect( moveDelta.sourcePosition.path ).to.deep.equal( [ 1, 1 ] );
		} );
	} );

	describe( 'howMany', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.howMany ).to.be.null;
		} );

		it( 'should be equal to the position where node is inserted', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.howMany ).to.equal( 2 );
		} );
	} );

	describe( 'targetPosition', () => {
		it( 'should be null if there are no operations in delta', () => {
			expect( moveDelta.targetPosition ).to.be.null;
		} );

		it( 'should be equal to the move operation\'s target position', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			expect( moveDelta.targetPosition.root ).to.equal( root );
			expect( moveDelta.targetPosition.path ).to.deep.equal( [ 2, 2 ] );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return empty MoveDelta if there are no operations in delta', () => {
			let reversed = moveDelta.getReversed();

			expect( reversed ).to.be.instanceof( MoveDelta );
			expect( reversed.operations.length ).to.equal( 0 );
		} );

		it( 'should return correct MoveDelta', () => {
			moveDelta.operations.push( new MoveOperation( new Position( root, [ 1, 1 ] ), 2, new Position( root, [ 2, 2 ] ), 0 ) );

			let reversed = moveDelta.getReversed();

			expect( reversed ).to.be.instanceof( MoveDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			expect( reversed.operations[ 0 ] ).to.be.instanceof( MoveOperation );
			expect( reversed.operations[ 0 ].sourcePosition.path ).to.deep.equal( [ 2, 2 ] );
			expect( reversed.operations[ 0 ].howMany ).to.equal( 2 );
			expect( reversed.operations[ 0 ].targetPosition.path ).to.deep.equal( [ 1, 1 ] );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MoveDelta.className ).to.equal( 'engine.treeModel.delta.MoveDelta' );
	} );
} );
