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

describe( 'RemoveOperation', function() {
	it( 'should remove node', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.root.children.push( new Character( doc.root, 'x' ) );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 0 ], doc ),
			doc.root.children[ 0 ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 0 );
	} );

	it( 'should remove set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 0 ], doc ),
			[ doc.root.children[ 0 ], doc.root.children[ 1 ], doc.root.children[ 2 ] ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 0 );
	} );

	it( 'should remove from between existing nodes', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 1 ], doc ),
			[ doc.root.children[ 1 ] ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 2 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'r' );
	} );

	it( 'should create a insert operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var nodes = [ new Character( null, 'b' ), new Character( null, 'a' ), new Character( null, 'r' ) ];
		var position = new Position( [ 0 ], doc );

		doc.root.children.push( nodes[ 0 ] );
		doc.root.children.push( nodes[ 1 ] );
		doc.root.children.push( nodes[ 2 ] );

		var operation = new RemoveOperation( position, nodes, 0 );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( InsertOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.nodes ).to.be.equals( nodes );
		expect( reverse.position ).to.be.equals( position );
	} );

	it( 'should undo remove set of nodes by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var nodes = [ new Character( null, 'b' ), new Character( null, 'a' ), new Character( null, 'r' ) ];
		var position = new Position( [ 0 ], doc );

		doc.root.children.push( nodes[ 0 ] );
		doc.root.children.push( nodes[ 1 ] );
		doc.root.children.push( nodes[ 2 ] );

		var operation = new RemoveOperation( position, nodes, 0 );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 0 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 3 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'a' );
		expect( doc.root.children[ 2 ].character ).to.be.equal( 'r' );
	}  );
} );