/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: document */

'use strict';

var modules = bender.amd.require(
	'document/document',
	'document/moveoperation',
	'document/position',
	'document/character',
	'document/element' );

describe( 'MoveOperation', function() {
	it( 'should move from one node to another', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Element = modules[ 'document/element' ];

		var doc = new Document();

		var p1 = new Element( doc.root, 'p1' );
		var p2 = new Element( doc.root, 'p2' );

		doc.root.children.push( p1 );
		doc.root.children.push( p2 );

		p1.children.push( new Element( doc.p1, 'x' ) );

		doc.applyOperation( new MoveOperation(
			new Position( [ 0, 0 ], doc ),
			new Position( [ 1, 0 ], doc ),
			p1.children[ 0 ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 2 );
		expect( doc.root.children[ 0 ].name ).to.be.equal( 'p1' );
		expect( doc.root.children[ 1 ].name ).to.be.equal( 'p2' );
		expect( p1.children.length ).to.be.equal( 0 );
		expect( p2.children.length ).to.be.equal( 1 );
		expect( p2.children[ 0 ].name ).to.be.equal( 'x' );
	} );

	it( 'should move position of children in one node backward', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.root.children.push( new Character( doc.root, 'x' ) );
		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );
		doc.root.children.push( new Character( doc.root, 'x' ) );

		doc.applyOperation( new MoveOperation(
			new Position( [ 2 ], doc ),
			new Position( [ 1 ], doc ),
			[ doc.root.children[ 2 ],  doc.root.children[ 3 ] ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 5 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'x' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'a' );
		expect( doc.root.children[ 2 ].character ).to.be.equal( 'r' );
		expect( doc.root.children[ 3 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 4 ].character ).to.be.equal( 'x' );
	} );

	it( 'should move position of children in one node forward', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		doc.root.children.push( new Character( doc.root, 'x' ) );
		doc.root.children.push( new Character( doc.root, 'b' ) );
		doc.root.children.push( new Character( doc.root, 'a' ) );
		doc.root.children.push( new Character( doc.root, 'r' ) );
		doc.root.children.push( new Character( doc.root, 'x' ) );

		doc.applyOperation( new MoveOperation(
			new Position( [ 1 ], doc ),
			new Position( [ 4 ], doc ),
			[ doc.root.children[ 1 ],  doc.root.children[ 2 ] ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 5 );
		expect( doc.root.children[ 0 ].character ).to.be.equal( 'x' );
		expect( doc.root.children[ 1 ].character ).to.be.equal( 'r' );
		expect( doc.root.children[ 2 ].character ).to.be.equal( 'b' );
		expect( doc.root.children[ 3 ].character ).to.be.equal( 'a' );
		expect( doc.root.children[ 4 ].character ).to.be.equal( 'x' );
	} );

	it( 'should create a move operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Character = modules[ 'document/character' ];

		var doc = new Document();

		var nodes = [ new Character( doc.root, 'b' ), new Character( doc.root, 'a' ), new Character( doc.root, 'r' ) ];

		var sourcePosition = new Position( [ 0 ], doc );
		var targetPosition = new Position( [ 4 ], doc );

		var operation = new MoveOperation( sourcePosition, targetPosition, nodes, doc.version );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( MoveOperation );
		expect( reverse.baseVersion ).to.be.equals( 1 );
		expect( reverse.nodes ).to.be.equals( nodes );
		expect( reverse.sourcePosition ).to.be.equals( targetPosition );
		expect( reverse.targetPosition ).to.be.equals( sourcePosition );
	} );

	it( 'should move node by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Element = modules[ 'document/element' ];

		var doc = new Document();

		var p1 = new Element( doc.root, 'p1' );
		var p2 = new Element( doc.root, 'p2' );

		doc.root.children.push( p1 );
		doc.root.children.push( p2 );

		p1.children.push( new Element( doc.p1, 'x' ) );

		var operation =  new MoveOperation(
			new Position( [ 0, 0 ], doc ),
			new Position( [ 1, 0 ], doc ),
			p1.children[ 0 ],
			doc.version );

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.children.length ).to.be.equal( 2 );
		expect( p1.children.length ).to.be.equal( 0 );
		expect( p2.children.length ).to.be.equal( 1 );
		expect( p2.children[ 0 ].name ).to.be.equal( 'x' );

		doc.applyOperation( operation.reverseOperation() );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.children.length ).to.be.equal( 2 );
		expect( p1.children.length ).to.be.equal( 1 );
		expect( p1.children[ 0 ].name ).to.be.equal( 'x' );
		expect( p2.children.length ).to.be.equal( 0 );
	} );
} );