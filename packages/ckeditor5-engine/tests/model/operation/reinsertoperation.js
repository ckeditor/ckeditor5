/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import Position from '../../../src/model/position';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'ReinsertOperation', () => {
	let doc, root, graveyard, operation, graveyardPosition, rootPosition;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		graveyard = doc.graveyard;

		graveyardPosition = new Position( graveyard, [ 0, 0 ] );
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

	it( 'should create a correct RemoveOperation as a reverse', () => {
		// Test reversed operation's target position.
		graveyard.appendChildren( new Element( '$graveyardHolder' ) );

		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition.isEqual( rootPosition ) ).to.be.true;

		// Reversed `ReinsertOperation` should target back to the same graveyard holder.
		expect( reverse.targetPosition.isEqual( graveyardPosition ) ).to.be.true;

		// Reversed `ReinsertOperation` should not create new graveyard holder.
		expect( reverse._needsHolderElement ).to.be.false;
	} );

	it( 'should undo reinsert set of nodes by applying reverse operation', () => {
		let reverse = operation.getReversed();

		const element = new Element();
		element.insertChildren( 0, new Text( 'xx' ) );
		graveyard.insertChildren( 0, element );

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( element.maxOffset ).to.equal( 0 );

		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 0 );
		// Don't check `element` - nodes are moved to new holder element.
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const serialized = jsonParseStringify( operation );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.ReinsertOperation',
				baseVersion: 0,
				howMany: 2,
				isSticky: false,
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
