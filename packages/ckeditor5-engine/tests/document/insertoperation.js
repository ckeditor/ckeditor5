/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/document',
	'document/insertoperation',
	'document/removeoperation',
	'document/position',
	'document/character' );

describe( 'InsertOperation', function() {
	it( 'should insert node', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation(
			new Position( [ 0 ], doc ),
			new Character( null, 'x' ),
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 1 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'x' );
	} );

	it( 'should insert set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation(
			new Position( [ 0 ], doc ),
			[ new Character( null, 'b' ), new Character( null, 'a' ), new Character( null, 'r' ) ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'a' );
		expect( doc.root.children[ 2 ].character ).to.be.equal( 'r' );
	} );

	it( 'should insert text', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation(
			new Position( [ 0 ], doc ),
			[ 'foo', new Character( null, 'x' ), 'bar' ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 7 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'f' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'o' );
		expect( doc.root.children[ 2 ].character ).to.be.equal( 'o' );
		expect( doc.root.children[ 3 ].character ).to.be.equal( 'x' );
		expect( doc.root.children[ 4 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 5 ].character ).to.be.equal( 'a' );
		expect( doc.root.children[ 6 ].character ).to.be.equal( 'r' );
	} );

	it( 'should create a remove operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var nodes = [ new Character( null, 'b' ), new Character( null, 'a' ), new Character( null, 'r' ) ];
		var position = new Position( [ 0 ], doc );

		var operation = new InsertOperation( position, nodes, 0 );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.nodes ).to.be.equals( nodes );
		expect( reverse.position ).to.be.equals( position );
	} );

	it( 'should undo insert node by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var operation = new InsertOperation(
			new Position( [ 0 ], doc ),
			new Character( null, 'x' ),
			doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var operation = new InsertOperation(
			new Position( [ 0 ], doc ),
			[ new Character( null, 'b' ), new Character( null, 'a' ), new Character( null, 'r' ) ],
			doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 0 );
	} );
} );