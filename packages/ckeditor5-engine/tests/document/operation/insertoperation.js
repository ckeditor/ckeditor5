/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/document',
	'document/operation/insertoperation',
	'document/operation/removeoperation',
	'document/position',
	'document/character',
	'document/nodelist'
);

describe( 'InsertOperation', function() {
	var Document, InsertOperation, RemoveOperation, Position, Character;

	before( function() {
		Document = modules[ 'document/document' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		Position = modules[ 'document/position' ];
		Character = modules[ 'document/character' ];
	} );

	var doc, root;

	beforeEach( function() {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert node', function() {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				new Character( 'x' ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 1 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
	} );

	it( 'should insert set of nodes', function() {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 3 );
		expect( root.getChild( 0 ).character ).to.equal( 'b' );
		expect( root.getChild( 1 ).character ).to.equal( 'a' );
		expect( root.getChild( 2 ).character ).to.equal( 'r' );
	} );

	it( 'should insert between existing nodes', function() {
		root.insertChildren( 0, 'xy' );

		doc.applyOperation(
			new InsertOperation(
				new Position( [ 1 ], root ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 5 );
		expect( root.getChild( 0 ).character ).to.equal( 'x' );
		expect( root.getChild( 1 ).character ).to.equal( 'b' );
		expect( root.getChild( 2 ).character ).to.equal( 'a' );
		expect( root.getChild( 3 ).character ).to.equal( 'r' );
		expect( root.getChild( 4 ).character ).to.equal( 'y' );
	} );

	it( 'should insert text', function() {
		doc.applyOperation(
			new InsertOperation(
				new Position( [ 0 ], root ),
				[ 'foo', new Character( 'x' ), 'bar' ],
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.getChildCount() ).to.equal( 7 );
		expect( root.getChild( 0 ).character ).to.equal( 'f' );
		expect( root.getChild( 1 ).character ).to.equal( 'o' );
		expect( root.getChild( 2 ).character ).to.equal( 'o' );
		expect( root.getChild( 3 ).character ).to.equal( 'x' );
		expect( root.getChild( 4 ).character ).to.equal( 'b' );
		expect( root.getChild( 5 ).character ).to.equal( 'a' );
		expect( root.getChild( 6 ).character ).to.equal( 'r' );
	} );

	it( 'should create a remove operation as a reverse', function() {
		var position = new Position( [ 0 ], root );
		var operation = new InsertOperation(
			position,
			[ 'foo', new Character( 'x' ), 'bar' ],
			0
		);

		var reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.sourcePosition ).to.equal( position );
		expect( reverse.howMany ).to.equal( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', function() {
		var operation = new InsertOperation(
			new Position( [ 0 ], root ),
			new Character( 'x' ),
			doc.version
		);

		var reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', function() {
		var operation = new InsertOperation(
			new Position( [ 0 ], root ),
			'bar',
			doc.version
		);

		var reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );
} );
