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

describe( 'RemoveOperation', function() {
	let Document, ReinsertOperation, RemoveOperation, MoveOperation, Position;

	before( function() {
		Document = modules[ 'document/document' ];
		ReinsertOperation = modules[ 'document/operation/reinsertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		MoveOperation = modules[ 'document/operation/removeoperation' ];
		Position = modules[ 'document/position' ];
	} );

	var doc, root, graveyard;

	beforeEach( function() {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc._graveyard;
	} );

	it( 'should extend MoveOperation class', function() {
		var operation = new RemoveOperation(
			new Position( [ 2 ], root ),
			2,
			doc.version
		);

		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should remove set of nodes and append them to graveyard root', function() {
		root.insertChildren( 0, 'fozbar' );

		var z = root.getChild( 2 );
		var b = root.getChild( 3 );
		var a = root.getChild( 4 );

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

	it( 'should create a reinsert operation as a reverse', function() {
		var position = new Position( [ 0 ], root );
		var operation = new RemoveOperation( position, 2, 0 );
		var reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( ReinsertOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.howMany ).to.equal( 2 );
		expect( reverse.sourcePosition ).to.equal( operation.targetPosition );
		expect( reverse.targetPosition ).to.equal( position );
	} );

	it( 'should undo remove set of nodes by applying reverse operation', function() {
		var position = new Position( [ 0 ], root );
		var operation = new RemoveOperation( position, 3, 0 );
		var reverse = operation.getReversed();

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
