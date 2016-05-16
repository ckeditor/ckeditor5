/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/engine/treemodel/document.js';
import ReinsertOperation from '/ckeditor5/engine/treemodel/operation/reinsertoperation.js';
import RemoveOperation from '/ckeditor5/engine/treemodel/operation/removeoperation.js';
import MoveOperation from '/ckeditor5/engine/treemodel/operation/moveoperation.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import treeModelTestUtils from '/tests/engine/treemodel/_utils/utils.js';

describe( 'RemoveOperation', () => {
	let doc, root, graveyard;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
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

	it( 'should remove set of nodes and append them to graveyard root', () => {
		root.insertChildren( 0, 'fozbar' );

		doc.applyOperation(
			new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 4 );
		expect( root.getChild( 2 ).character ).to.equal( 'a' );

		expect( graveyard.getChildCount() ).to.equal( 2 );
		expect( graveyard.getChild( 0 ).character ).to.equal( 'z' );
		expect( graveyard.getChild( 1 ).character ).to.equal( 'b' );
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

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 0 );

		doc.applyOperation( reverse );

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

			const serialized = treeModelTestUtils.jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__class: 'engine.treeModel.operation.RemoveOperation',
				baseVersion: 0,
				delta: null,
				howMany: 2,
				isSticky: false,
				movedRangeStart: treeModelTestUtils.jsonParseStringify( op.movedRangeStart ),
				sourcePosition: treeModelTestUtils.jsonParseStringify( op.sourcePosition ),
				targetPosition: treeModelTestUtils.jsonParseStringify( op.targetPosition )
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

			const serialized = treeModelTestUtils.jsonParseStringify( op );
			const deserialized = RemoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
