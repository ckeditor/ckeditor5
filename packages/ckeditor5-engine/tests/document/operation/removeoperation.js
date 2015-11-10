/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/operation/reinsertoperation',
	'document/operation/removeoperation',
	'document/operation/moveoperation',
	'document/position'
);

describe( 'RemoveOperation', () => {
	let Document, ReinsertOperation, RemoveOperation, MoveOperation, Position;

	before( () => {
		Document = modules[ 'document/document' ];
		ReinsertOperation = modules[ 'document/operation/reinsertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		MoveOperation = modules[ 'document/operation/removeoperation' ];
		Position = modules[ 'document/position' ];
	} );

	let doc, root, graveyard;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc._graveyard;
	} );

	it( 'should extend MoveOperation class', () => {
		let operation = new RemoveOperation(
			new Position( [ 2 ], root ),
			2,
			doc.version
		);

		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should remove set of nodes and append them to graveyard root', () => {
		root.insertChildren( 0, 'fozbar' );

		let z = root.getChild( 2 );
		let b = root.getChild( 3 );
		let a = root.getChild( 4 );

		doc.applyOperation(
			new RemoveOperation(
				new Position( [ 2 ], root ),
				2,
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 4 );
		expect( root.getChild( 2 ) ).to.equal( a );

		expect( graveyard.getChildCount() ).to.equal( 2 );
		expect( graveyard.getChild( 0 ) ).to.equal( z );
		expect( graveyard.getChild( 1 ) ).to.equal( b );
	} );

	it( 'should create a reinsert operation as a reverse', () => {
		let position = new Position( [ 0 ], root );
		let operation = new RemoveOperation( position, 2, 0 );
		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ReinsertOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition ).to.equal( operation.targetPosition );
		expect( reverse.targetPosition ).to.equal( position );
	} );

	it( 'should undo remove set of nodes by applying reverse operation', () => {
		let position = new Position( [ 0 ], root );
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
} );
