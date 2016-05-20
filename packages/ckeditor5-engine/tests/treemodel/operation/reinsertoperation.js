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
import { jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

describe( 'ReinsertOperation', () => {
	let doc, root, graveyard, operation, graveyardPosition, rootPosition;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc.graveyard;

		graveyardPosition = new Position( graveyard, [ 0 ] );
		rootPosition = new Position( root, [ 0 ] );

		operation = new ReinsertOperation(
			graveyardPosition,
			2,
			rootPosition,
			doc.version
		);
	} );

	it( 'should have position property equal to the position where node will be reinserted', () => {
		expect( operation.position.isEqual( rootPosition ) ).to.be.true;

		// Setting also works:
		operation.position = new Position( root, [ 1 ] );
		expect( operation.position.isEqual( new Position( root, [ 1 ] ) ) ).to.be.true;
	} );

	it( 'should have proper type', () => {
		expect( operation.type ).to.equal( 'reinsert' );
	} );

	it( 'should not be sticky', () => {
		expect( operation.isSticky ).to.be.false;
	} );

	it( 'should extend MoveOperation class', () => {
		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should create ReinsertOperation with same parameters when cloned', () => {
		let clone = operation.clone();

		expect( clone ).to.be.instanceof( ReinsertOperation );
		expect( clone.sourcePosition.isEqual( operation.sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( operation.targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( operation.howMany );
		expect( clone.baseVersion ).to.equal( operation.baseVersion );
	} );

	it( 'should create a RemoveOperation as a reverse', () => {
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( rootPosition ) ).to.be.true;
		expect( reverse.targetPosition.isEqual( graveyardPosition ) ).to.be.true;
	} );

	it( 'should undo reinsert set of nodes by applying reverse operation', () => {
		let reverse = operation.getReversed();

		graveyard.insertChildren( 0, 'bar' );

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 2 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
		expect( graveyard.getChildCount() ).to.equal( 3 );

		expect( graveyard.getChild( 0 ).character ).to.equal( 'b' );
		expect( graveyard.getChild( 1 ).character ).to.equal( 'a' );
		expect( graveyard.getChild( 2 ).character ).to.equal( 'r' );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const serialized = jsonParseStringify( operation );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.treeModel.operation.ReinsertOperation',
				baseVersion: 0,
				howMany: 2,
				isSticky: false,
				movedRangeStart: jsonParseStringify( operation.movedRangeStart ),
				sourcePosition: jsonParseStringify( operation.sourcePosition ),
				targetPosition: jsonParseStringify( operation.targetPosition )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper ReinsertOperation from json object', () => {
			const serialized = jsonParseStringify( operation );
			const deserialized = ReinsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( operation );
		} );
	} );
} );
