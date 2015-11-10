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

describe( 'ReinsertOperation', () => {
	let Document, ReinsertOperation, RemoveOperation, MoveOperation, Position;

	before( () => {
		Document = modules[ 'document/document' ];
		ReinsertOperation = modules[ 'document/operation/reinsertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		MoveOperation = modules[ 'document/operation/moveoperation' ];
		Position = modules[ 'document/position' ];
	} );

	let doc, root, graveyard, operation, graveyardPosition, rootPosition;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
		graveyard = doc._graveyard;

		graveyardPosition = new Position( [ 0 ], graveyard );
		rootPosition = new Position( [ 0 ], root );

		operation = new ReinsertOperation(
			graveyardPosition,
			rootPosition,
			2,
			doc.version
		);
	} );

	it( 'should extend MoveOperation class', () => {
		expect( operation ).to.be.instanceof( MoveOperation );
	} );

	it( 'should create a remove operation as a reverse', () => {
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
} );
