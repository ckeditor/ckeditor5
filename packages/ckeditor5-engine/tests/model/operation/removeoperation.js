/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import ReinsertOperation from '../../../src/model/operation/reinsertoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import MoveOperation from '../../../src/model/operation/moveoperation';
import Position from '../../../src/model/position';
import Text from '../../../src/model/text';
import Element from '../../../src/model/element';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

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

	it( 'should be able to remove set of nodes and append them to holder element in graveyard root', () => {
		root.insertChildren( 0, new Text( 'fozbar' ) );

		doc.applyOperation( wrapInDelta(
			new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 4 );
		expect( root.getChild( 0 ).data ).to.equal( 'foar' );

		expect( graveyard.maxOffset ).to.equal( 1 );
		expect( graveyard.getChild( 0 ).getChild( 0 ).data ).to.equal( 'zb' );
	} );

	it( 'should be able to remove set of nodes and append them to existing element in graveyard root', () => {
		root.insertChildren( 0, new Text( 'fozbar' ) );
		graveyard.appendChildren( new Element( '$graveyardHolder' ) );

		const op = new RemoveOperation(
			new Position( root, [ 0 ] ),
			1,
			doc.version
		);

		// Manually set holder element properties.
		op._needsHolderElement = false;
		op._holderElementOffset = 0;

		doc.applyOperation( wrapInDelta( op ) );

		expect( graveyard.maxOffset ).to.equal( 1 );
		expect( graveyard.getChild( 0 ).getChild( 0 ).data ).to.equal( 'f' );
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

		root.insertChildren( 0, new Text( 'bar' ) );

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 0 );

		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 3 );
		expect( root.getChild( 0 ).data ).to.equal( 'bar' );
	} );

	it( 'should properly remove a node that is already in a graveyard', () => {
		doc.graveyard.appendChildren( new Element( '$graveyardHolder', {}, [ new Text( 'foo' ) ] ) );

		let position = new Position( doc.graveyard, [ 0, 0 ] );
		let operation = new RemoveOperation( position, 1, 0 );

		operation.targetPosition.path = [ 0, 0 ];

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.graveyard.childCount ).to.equal( 2 );
		expect( doc.graveyard.getChild( 0 ).getChild( 0 ).data ).to.equal( 'f' );
		expect( doc.graveyard.getChild( 1 ).getChild( 0 ).data ).to.equal( 'oo' );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const op = new RemoveOperation(
				new Position( root, [ 2 ] ),
				2,
				doc.version
			);

			op._needsHolderElement = false;

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.RemoveOperation',
				baseVersion: 0,
				howMany: 2,
				isSticky: false,
				sourcePosition: jsonParseStringify( op.sourcePosition ),
				targetPosition: jsonParseStringify( op.targetPosition ),
				_needsHolderElement: false
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

			op._needsHolderElement = false;

			doc.graveyard.appendChildren( [ new Element( '$graveyardHolder' ), new Element( '$graveyardHolder' ) ] );

			const serialized = jsonParseStringify( op );
			const deserialized = RemoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
