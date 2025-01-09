/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import MoveOperation from '../../../src/model/operation/moveoperation.js';
import Position from '../../../src/model/position.js';
import Element from '../../../src/model/element.js';
import Text from '../../../src/model/text.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MoveOperation', () => {
	let model, doc, root, gy;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
	} );

	it( 'should have proper type', () => {
		const move = new MoveOperation( new Position( root, [ 0, 0 ] ), 1, new Position( root, [ 1, 0 ] ), 0 );
		expect( move.type ).to.equal( 'move' );

		const remove1 = new MoveOperation( new Position( root, [ 0, 0 ] ), 1, new Position( gy, [ 0 ] ), 0 );
		expect( remove1.type ).to.equal( 'remove' );

		const remove2 = new MoveOperation( new Position( gy, [ 0 ] ), 1, new Position( gy, [ 1 ] ), 0 );
		expect( remove2.type ).to.equal( 'remove' );

		const reinsert = new MoveOperation( new Position( gy, [ 0 ] ), 1, new Position( root, [ 0, 0 ] ), 0 );
		expect( reinsert.type ).to.equal( 'reinsert' );
	} );

	it( 'should move from one node to another', () => {
		const p1 = new Element( 'p1', [], new Element( 'x' ) );
		const p2 = new Element( 'p2' );

		root._insertChild( 0, [ p1, p2 ] );

		model.applyOperation(
			new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				1,
				new Position( root, [ 1, 0 ] ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( root.getChild( 1 ).name ).to.equal( 'p2' );
		expect( p1.maxOffset ).to.equal( 0 );
		expect( p2.maxOffset ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );
	} );

	it( 'should move position of children in one node backward', () => {
		root._insertChild( 0, new Text( 'xbarx' ) );

		model.applyOperation(
			new MoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( root, [ 1 ] ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xarbx' );
	} );

	it( 'should move position of children in one node forward', () => {
		root._insertChild( 0, new Text( 'xbarx' ) );

		model.applyOperation(
			new MoveOperation(
				new Position( root, [ 1 ] ),
				2,
				new Position( root, [ 4 ] ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xrbax' );
	} );

	it( 'should create a proper MoveOperation as a reverse', () => {
		const sourcePosition = new Position( root, [ 0 ] );
		const targetPosition = new Position( root, [ 4 ] );

		let operation = new MoveOperation( sourcePosition, 3, targetPosition, doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( MoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 3 );
		expect( reverse.sourcePosition.path ).is.deep.equal( [ 1 ] );
		expect( reverse.targetPosition.path ).is.deep.equal( [ 0 ] );

		operation = new MoveOperation( targetPosition, 3, sourcePosition, doc.version );
		reverse = operation.getReversed();

		expect( reverse.sourcePosition.path ).is.deep.equal( [ 0 ] );
		expect( reverse.targetPosition.path ).is.deep.equal( [ 7 ] );
	} );

	it( 'should undo move node by applying reverse operation', () => {
		const p1 = new Element( 'p1', [], new Element( 'x' ) );
		const p2 = new Element( 'p2' );

		root._insertChild( 0, [ p1, p2 ] );

		const operation = new MoveOperation(
			new Position( root, [ 0, 0 ] ),
			1,
			new Position( root, [ 1, 0 ] ),
			doc.version
		);

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( p1.maxOffset ).to.equal( 0 );
		expect( p2.maxOffset ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );

		model.applyOperation( operation.getReversed() );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( p1.maxOffset ).to.equal( 1 );
		expect( p1.getChild( 0 ).name ).to.equal( 'x' );
		expect( p2.maxOffset ).to.equal( 0 );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if number of nodes to move exceeds the number of existing nodes in given element', () => {
			root._insertChild( 0, new Text( 'xbarx' ) );

			const operation = new MoveOperation(
				new Position( root, [ 3 ] ),
				3,
				new Position( root, [ 1 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-nodes-do-not-exist/, model );
		} );

		it( 'should throw an error if target or source parent-element specified by position does not exist', () => {
			const p = new Element( 'p' );
			p._insertChild( 0, new Text( 'foo' ) );
			root._insertChild( 0, [ new Text( 'ab' ), p ] );

			const operation = new MoveOperation(
				new Position( root, [ 2, 0 ] ),
				3,
				new Position( root, [ 1 ] ),
				doc.version
			);

			root._removeChildren( 1 );

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if operation tries to move a range between the beginning and the end of that range', () => {
			root._insertChild( 0, new Text( 'xbarx' ) );

			const operation = new MoveOperation(
				new Position( root, [ 1 ] ),
				3,
				new Position( root, [ 2 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-range-into-itself/, model );
		} );

		it( 'should throw an error if operation tries to move a range into a sub-tree of a node that is in that range', () => {
			const p = new Element( 'p', [], [ new Element( 'p' ) ] );
			root._insertChild( 0, [ new Text( 'ab' ), p, new Text( 'xy' ) ] );

			const operation = new MoveOperation(
				new Position( root, [ 1 ] ),
				3,
				new Position( root, [ 2, 0, 0 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-node-into-itself/, model );
		} );

		it( 'should not throw an error if operation move a range into a sibling', () => {
			const p = new Element( 'p' );
			root._insertChild( 0, [ new Text( 'ab' ), p, new Text( 'xy' ) ] );

			const operation = new MoveOperation(
				new Position( root, [ 1 ] ),
				1,
				new Position( root, [ 2, 0 ] ),
				doc.version
			);

			expect( () => operation._validate() ).not.to.throw();
		} );

		it( 'should not throw when operation paths looks like incorrect but move is between different roots', () => {
			const p = new Element( 'p' );
			root._insertChild( 0, [ new Text( 'a' ), p, new Text( 'b' ) ] );
			doc.graveyard._insertChild( 0, new Text( 'abc' ) );

			const operation = new MoveOperation(
				new Position( doc.graveyard, [ 0 ] ),
				2,
				new Position( root, [ 1, 0 ] ),
				doc.version
			);

			expect( () => operation._validate() ).not.to.throw();
		} );
	} );

	it( 'should create MoveOperation with the same parameters when cloned', () => {
		const sourcePosition = new Position( root, [ 0 ] );
		const targetPosition = new Position( root, [ 1 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.equal( op );

		expect( clone ).to.be.instanceof( MoveOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'getMovedRangeStart', () => {
		it( 'should return move operation target position transformed by removing move operation source range', () => {
			const sourcePosition = new Position( root, [ 0, 2 ] );
			const targetPosition = new Position( root, [ 0, 6 ] );
			const howMany = 3;
			const baseVersion = doc.version;

			const op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

			expect( op.getMovedRangeStart().path ).to.deep.equal( [ 0, 3 ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const sourcePosition = new Position( root, [ 0, 0 ] );
			const targetPosition = new Position( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'MoveOperation',
				baseVersion: 0,
				howMany: 1,
				sourcePosition: op.sourcePosition.toJSON(),
				targetPosition: op.targetPosition.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MoveOperation from json object', () => {
			const sourcePosition = new Position( root, [ 0, 0 ] );
			const targetPosition = new Position( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = op.toJSON();
			const deserialized = MoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
