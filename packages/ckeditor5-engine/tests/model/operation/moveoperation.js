/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, operation */

import Document from '/ckeditor5/engine/model/document.js';
import MoveOperation from '/ckeditor5/engine/model/operation/moveoperation.js';
import Position from '/ckeditor5/engine/model/position.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import { jsonParseStringify, wrapInDelta } from '/tests/engine/model/_utils/utils.js';

describe( 'MoveOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
	} );

	it( 'should have proper type', () => {
		const op = new MoveOperation(
			new Position( root, [ 0, 0 ] ),
			1,
			new Position( root, [ 1, 0 ] ),
			doc.version
		);

		expect( op.type ).to.equal( 'move' );
	} );

	it( 'should be sticky', () => {
		const op = new MoveOperation(
			new Position( root, [ 0, 0 ] ),
			1,
			new Position( root, [ 1, 0 ] ),
			doc.version
		);

		expect( op.isSticky ).to.be.false;
	} );

	it( 'should move from one node to another', () => {
		let p1 = new Element( 'p1', [], new Element( 'x' ) );
		let p2 = new Element( 'p2' );

		root.insertChildren( 0, [ p1, p2 ] );

		doc.applyOperation( wrapInDelta(
			new MoveOperation(
				new Position( root, [ 0, 0 ] ),
				1,
				new Position( root, [ 1, 0 ] ),
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( root.getChild( 0 ).name ).to.equal( 'p1' );
		expect( root.getChild( 1 ).name ).to.equal( 'p2' );
		expect( p1.maxOffset ).to.equal( 0 );
		expect( p2.maxOffset ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );
	} );

	it( 'should move position of children in one node backward', () => {
		root.insertChildren( 0, new Text( 'xbarx' ) );

		doc.applyOperation( wrapInDelta(
			new MoveOperation(
				new Position( root, [ 2 ] ),
				2,
				new Position( root, [ 1 ] ),
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xarbx' );
	} );

	it( 'should move position of children in one node forward', () => {
		root.insertChildren( 0, new Text( 'xbarx' ) );

		doc.applyOperation( wrapInDelta(
			new MoveOperation(
				new Position( root, [ 1 ] ),
				2,
				new Position( root, [ 4 ] ),
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xrbax' );
	} );

	it( 'should create a proper MoveOperation as a reverse', () => {
		let sourcePosition = new Position( root, [ 0 ] );
		let targetPosition = new Position( root, [ 4 ] );

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
		let p1 = new Element( 'p1', [], new Element( 'x' ) );
		let p2 = new Element( 'p2' );

		root.insertChildren( 0, [ p1, p2 ] );

		let operation = new MoveOperation(
			new Position( root, [ 0, 0 ] ),
			1,
			new Position( root, [ 1, 0 ] ),
			doc.version
		);

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( p1.maxOffset ).to.equal( 0 );
		expect( p2.maxOffset ).to.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.equal( 'x' );

		doc.applyOperation( wrapInDelta( operation.getReversed() ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 2 );
		expect( p1.maxOffset ).to.equal( 1 );
		expect( p1.getChild( 0 ).name ).to.equal( 'x' );
		expect( p2.maxOffset ).to.equal( 0 );
	} );

	it( 'should throw an error if number of nodes to move exceeds the number of existing nodes in given element', () => {
		root.insertChildren( 0, new Text( 'xbarx' ) );

		let operation = new MoveOperation(
			new Position( root, [ 3 ] ),
			3,
			new Position( root, [ 1 ] ),
			doc.version
		);

		expect( () => doc.applyOperation( wrapInDelta( operation ) ) ).to.throwCKEditorError( /move-operation-nodes-do-not-exist/ );
	} );

	it( 'should throw an error if target or source parent-element specified by position does not exist', () => {
		let p = new Element( 'p' );
		p.insertChildren( 0, new Text( 'foo' ) );
		root.insertChildren( 0, [ new Text( 'ab' ), p ] );

		let operation = new MoveOperation(
			new Position( root, [ 2, 0 ] ),
			3,
			new Position( root, [ 1 ] ),
			doc.version
		);

		root.removeChildren( 1 );

		expect( () => doc.applyOperation( wrapInDelta( operation ) ) ).to.throwCKEditorError( /move-operation-position-invalid/ );
	} );

	it( 'should throw an error if operation tries to move a range between the beginning and the end of that range', () => {
		root.insertChildren( 0, new Text( 'xbarx' ) );

		let operation = new MoveOperation(
			new Position( root, [ 1 ] ),
			3,
			new Position( root, [ 2 ] ),
			doc.version
		);

		expect( () => doc.applyOperation( wrapInDelta( operation ) ) ).to.throwCKEditorError( /move-operation-range-into-itself/ );
	} );

	it( 'should throw an error if operation tries to move a range into a sub-tree of a node that is in that range', () => {
		let p = new Element( 'p', [], [ new Element( 'p' ) ] );
		root.insertChildren( 0, [ new Text( 'ab' ), p, new Text( 'xy' ) ] );

		let operation = new MoveOperation(
			new Position( root, [ 1 ] ),
			3,
			new Position( root, [ 2, 0, 0 ] ),
			doc.version
		);

		expect( () => doc.applyOperation( wrapInDelta( operation ) ) ).to.throwCKEditorError( /move-operation-node-into-itself/ );
	} );

	it( 'should not throw an error if operation move a range into a sibling', () => {
		let p = new Element( 'p' );
		root.insertChildren( 0, [ new Text( 'ab' ), p, new Text( 'xy' ) ] );

		let operation = new MoveOperation(
			new Position( root, [ 1 ] ),
			1,
			new Position( root, [ 2, 0 ] ),
			doc.version
		);

		expect(
			() => {
				doc.applyOperation( wrapInDelta( operation ) );
			}
		).not.to.throw();

		expect( root.maxOffset ).to.equal( 4 );
		expect( p.maxOffset ).to.equal( 1 );
		expect( p.getChild( 0 ).data ).to.equal( 'b' );
	} );

	it( 'should not throw when operation paths looks like incorrect but move is between different roots', () => {
		let p = new Element( 'p' );
		root.insertChildren( 0, [ new Text( 'a' ), p, new Text( 'b' ) ] );
		doc.graveyard.insertChildren( 0, new Text( 'abc' ) );

		let operation = new MoveOperation(
			new Position( doc.graveyard, [ 0 ] ),
			2,
			new Position( root, [ 1, 0 ] ),
			doc.version
		);

		expect(
			() => {
				doc.applyOperation( wrapInDelta( operation ) );
			}
		).not.to.throw();
	} );

	it( 'should create MoveOperation with the same parameters when cloned', () => {
		let sourcePosition = new Position( root, [ 0 ] );
		let targetPosition = new Position( root, [ 1 ] );
		let howMany = 4;
		let baseVersion = doc.version;

		let op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( MoveOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).to.be.true;
		expect( clone.targetPosition.isEqual( targetPosition ) ).to.be.true;
		expect( clone.howMany ).to.equal( howMany );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const sourcePosition = new Position( root, [ 0, 0 ] );
			const targetPosition = new Position( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.MoveOperation',
				baseVersion: 0,
				howMany: 1,
				isSticky: false,
				movedRangeStart: jsonParseStringify( op.movedRangeStart ),
				sourcePosition: jsonParseStringify( sourcePosition ),
				targetPosition: jsonParseStringify( targetPosition )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MoveOperation from json object', () => {
			const sourcePosition = new Position( root, [ 0, 0 ] );
			const targetPosition = new Position( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = MoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
