/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

import Document from '/ckeditor5/engine/model/document.js';
import ReinsertOperation from '/ckeditor5/engine/model/operation/reinsertoperation.js';
import RemoveOperation from '/ckeditor5/engine/model/operation/removeoperation.js';
import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import Position from '/ckeditor5/engine/model/position.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import { jsonParseStringify, wrapInDelta } from '/tests/engine/model/_utils/utils.js';

describe( 'RemoveOperation', () => {
	let doc, root, graveyard;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		graveyard = doc.graveyard;
	} );

	it( 'should have proper type', () => {
		const op = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			doc.version
		);

		expect( op.type ).to.equal( 'remove' );
	} );

	it( 'should not be sticky', () => {
		const op = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			doc.version
		);

		expect( op.isSticky ).to.be.false;
	} );

	it( 'should extend MoveOperation class', () => {
		let operation = new RemoveOperation(
			new Position( root, [ 2 ] ),
			2,
			doc.version
		);

		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should remove set of nodes and append them to holder element in graveyard root', () => {
		root.insertChildren( 0, 'fozbar' );

		doc.applyOperation( wrapInDelta(
			new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 4 );
		expect( root.getChild( 2 ).character ).to.equal( 'a' );

		expect( graveyard.getChildCount() ).to.equal( 1 );
		expect( graveyard.getChild( 0 ).getChild( 0 ).character ).to.equal( 'z' );
		expect( graveyard.getChild( 0 ).getChild( 1 ).character ).to.equal( 'b' );
	} );

	it( 'should create new holder element for remove operations in different deltas', () => {
		root.insertChildren( 0, 'fozbar' );

		doc.applyOperation( wrapInDelta(
			new RemoveOperation(
				new Position( root, [ 0 ] ),
				1,
				doc.version
			)
		) );

		doc.applyOperation( wrapInDelta(
			new RemoveOperation(
				new Position( root, [ 0 ] ),
				1,
				doc.version
			)
		) );

		doc.applyOperation( wrapInDelta(
			new RemoveOperation(
				new Position( root, [ 0 ] ),
				1,
				doc.version
			)
		) );

		expect( graveyard.getChildCount() ).to.equal( 3 );
		expect( graveyard.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
		expect( graveyard.getChild( 1 ).getChild( 0 ).character ).to.equal( 'o' );
		expect( graveyard.getChild( 2 ).getChild( 0 ).character ).to.equal( 'z' );
	} );

	it( 'should not create new holder element for remove operation if it was already created for given delta', () => {
		root.insertChildren( 0, 'fozbar' );

		let delta = new Delta();

		// This simulates i.e. RemoveOperation that got split into two operations during OT.
		let removeOpA = new RemoveOperation(
			new Position( root, [ 1 ] ),
			1,
			doc.version
		);
		let removeOpB = new RemoveOperation(
			new Position( root, [ 0 ] ),
			1,
			doc.version + 1
		);

		delta.addOperation( removeOpA );
		delta.addOperation( removeOpB );

		doc.applyOperation( removeOpA );
		doc.applyOperation( removeOpB );

		expect( graveyard.getChildCount() ).to.equal( 1 );
		expect( graveyard.getChild( 0 ).getChild( 0 ).character ).to.equal( 'f' );
		expect( graveyard.getChild( 0 ).getChild( 1 ).character ).to.equal( 'o' );
	} );

	it( 'should create RemoveOperation with same parameters when cloned', () => {
		let pos = new Position( root, [ 2 ] );

		let operation = new RemoveOperation( pos, 2, doc.version );
		let clone = operation.clone();

		expect( clone ).to.be.instanceof( RemoveOperation );
		expect( clone.sourcePosition.isEqual( pos ) ).to.be.true;
		expect( clone.howMany ).to.equal( operation.howMany );
		expect( clone.baseVersion ).to.equal( operation.baseVersion );
	} );

	it( 'should create a ReinsertOperation as a reverse', () => {
		let position = new Position( root, [ 0 ] );
		let operation = new RemoveOperation( position, 2, 0 );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ReinsertOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( position ) ).to.be.true;
	} );

	it( 'should undo remove set of nodes by applying reverse operation', () => {
		let position = new Position( root, [ 0 ] );
		let operation = new RemoveOperation( position, 3, 0 );
		let reverse = operation.getReversed();

		root.insertChildren( 0, 'bar' );

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 0 );

		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'b' );
		expect( root.getChild( 1 ).character ).to.equal( 'a' );
		expect( root.getChild( 2 ).character ).to.equal( 'r' );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const op = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			);

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.RemoveOperation',
				baseVersion: 0,
				howMany: 2,
				isSticky: false,
				movedRangeStart: jsonParseStringify( op.movedRangeStart ),
				sourcePosition: jsonParseStringify( op.sourcePosition ),
				targetPosition: jsonParseStringify( op.targetPosition )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper RemoveOperation from json object', () => {
			const op = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			);

			const serialized = jsonParseStringify( op );
			const deserialized = RemoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
