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
	'document/character',
	'document/nodelist' );

describe( 'InsertOperation', function() {
	it( 'should insert node', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation(
			new Position( [ 0 ], doc.root ),
			new Character( 'x' ),
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 1 );
		expect( doc.root.children.get( 0 ).character ).to.be.equal( 'x' );
	} );

	it( 'should insert set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation( new Position( [ 0 ], doc.root ), 'bar', doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children.get( 0 ).character ).to.be.equal( 'b' );
		expect( doc.root.children.get( 1 ).character ).to.be.equal( 'a' );
		expect( doc.root.children.get( 2 ).character ).to.be.equal( 'r' );
	} );

	it( 'should insert between existing nodes', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'xy' );

		doc.applyOperation( new InsertOperation( new Position( [ 1 ], doc.root ), 'bar', doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 5 );
		expect( doc.root.children.get( 0 ).character ).to.be.equal( 'x' );
		expect( doc.root.children.get( 1 ).character ).to.be.equal( 'b' );
		expect( doc.root.children.get( 2 ).character ).to.be.equal( 'a' );
		expect( doc.root.children.get( 3 ).character ).to.be.equal( 'r' );
		expect( doc.root.children.get( 4 ).character ).to.be.equal( 'y' );
	} );

	it( 'should insert text', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.applyOperation( new InsertOperation(
			new Position( [ 0 ], doc.root ),
			[ 'foo', new Character( 'x' ), 'bar' ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 7 );
		expect( doc.root.children.get( 0 ).character ).to.be.equal( 'f' );
		expect( doc.root.children.get( 1 ).character ).to.be.equal( 'o' );
		expect( doc.root.children.get( 2 ).character ).to.be.equal( 'o' );
		expect( doc.root.children.get( 3 ).character ).to.be.equal( 'x' );
		expect( doc.root.children.get( 4 ).character ).to.be.equal( 'b' );
		expect( doc.root.children.get( 5 ).character ).to.be.equal( 'a' );
		expect( doc.root.children.get( 6 ).character ).to.be.equal( 'r' );
	} );

	it( 'should create a remove operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var NodeList = modules[ 'document/nodelist' ];

		var doc = new Document();

		var nodeList = new NodeList( 'bar' );
		var position = new Position( [ 0 ], doc.root );

		var operation = new InsertOperation( position, nodeList, 0 );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.nodeList ).to.be.equals( nodeList );
		expect( reverse.position ).to.be.equals( position );
	} );

	it( 'should undo insert node by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var operation = new InsertOperation(
			new Position( [ 0 ], doc.root ),
			new Character( 'x' ),
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

		var doc = new Document();

		var operation = new InsertOperation( new Position( [ 0 ], doc.root ), 'bar', doc.version );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 0 );
	} );
} );