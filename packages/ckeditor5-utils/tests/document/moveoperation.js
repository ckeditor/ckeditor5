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
	'document/element',
	'document/nodelist',
	'ckeditorerror' );

describe( 'MoveOperation', function() {
	it( 'should move from one node to another', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Element = modules[ 'document/element' ];

		var doc = new Document();

		var p1 = new Element( 'p1', [], new Element( 'x' ) );
		var p2 = new Element( 'p2' );

		doc.root.insertChildren( 0, [ p1, p2 ] );

		doc.applyOperation( new MoveOperation(
			new Position( [ 0, 0 ], doc.root ),
			new Position( [ 1, 0 ], doc.root ),
			p1.getChild( 0 ),
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 2 );
		expect( doc.root.getChild( 0 ).name ).to.be.equal( 'p1' );
		expect( doc.root.getChild( 1 ).name ).to.be.equal( 'p2' );
		expect( p1.getChildCount() ).to.be.equal( 0 );
		expect( p2.getChildCount() ).to.be.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.be.equal( 'x' );
	} );

	it( 'should move position of children in one node backward', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'xbarx' );

		doc.applyOperation( new MoveOperation(
			new Position( [ 2 ], doc.root ),
			new Position( [ 1 ], doc.root ),
			[ doc.root.getChild( 2 ),  doc.root.getChild( 3 ) ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 5 );
		expect( doc.root.getChild( 0 ).character ).to.be.equal( 'x' );
		expect( doc.root.getChild( 1 ).character ).to.be.equal( 'a' );
		expect( doc.root.getChild( 2 ).character ).to.be.equal( 'r' );
		expect( doc.root.getChild( 3 ).character ).to.be.equal( 'b' );
		expect( doc.root.getChild( 4 ).character ).to.be.equal( 'x' );
	} );

	it( 'should move position of children in one node forward', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'xbarx' );

		doc.applyOperation( new MoveOperation(
			new Position( [ 1 ], doc.root ),
			new Position( [ 4 ], doc.root ),
			[ doc.root.getChild( 1 ),  doc.root.getChild( 2 ) ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 5 );
		expect( doc.root.getChild( 0 ).character ).to.be.equal( 'x' );
		expect( doc.root.getChild( 1 ).character ).to.be.equal( 'r' );
		expect( doc.root.getChild( 2 ).character ).to.be.equal( 'b' );
		expect( doc.root.getChild( 3 ).character ).to.be.equal( 'a' );
		expect( doc.root.getChild( 4 ).character ).to.be.equal( 'x' );
	} );

	it( 'should create a move operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var NodeList = modules[ 'document/nodelist' ];

		var doc = new Document();

		var nodeList = new NodeList( 'bar' );

		var sourcePosition = new Position( [ 0 ], doc.root );
		var targetPosition = new Position( [ 4 ], doc.root );

		var operation = new MoveOperation( sourcePosition, targetPosition, nodeList, doc.version );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( MoveOperation );
		expect( reverse.baseVersion ).to.equals( 1 );
		expect( reverse.nodeList ).to.equals( nodeList );
		expect( reverse.sourcePosition ).to.equals( targetPosition );
		expect( reverse.targetPosition ).to.equals( sourcePosition );
	} );

	it( 'should move node by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var MoveOperation = modules[ 'document/moveoperation' ];
		var Position = modules[ 'document/position' ];
		var Element = modules[ 'document/element' ];

		var doc = new Document();

		var p1 = new Element( 'p1', [], new Element( 'x' ) );
		var p2 = new Element( 'p2' );

		doc.root.insertChildren( 0, [ p1, p2 ] );

		var operation =  new MoveOperation(
			new Position( [ 0, 0 ], doc.root ),
			new Position( [ 1, 0 ], doc.root ),
			p1.getChild( 0 ),
			doc.version );

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 2 );
		expect( p1.getChildCount() ).to.be.equal( 0 );
		expect( p2.getChildCount() ).to.be.equal( 1 );
		expect( p2.getChild( 0 ).name ).to.be.equal( 'x' );

		doc.applyOperation( operation.reverseOperation() );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.getChildCount() ).to.be.equal( 2 );
		expect( p1.getChildCount() ).to.be.equal( 1 );
		expect( p1.getChild( 0 ).name ).to.be.equal( 'x' );
		expect( p2.getChildCount() ).to.be.equal( 0 );
	} );

	if ( CKEDITOR.isDebug ) {
		it( 'should throw error if nodes to move are different then actual nodes', function() {
			var Document = modules[ 'document/document' ];
			var MoveOperation = modules[ 'document/moveoperation' ];
			var Position = modules[ 'document/position' ];
			var CKEditorError = modules.ckeditorerror;

			var doc = new Document();

			doc.root.insertChildren( 0, 'xbarx' );

			expect( function() {
				doc.applyOperation( new MoveOperation(
					new Position( [ 1 ], doc.root ),
					new Position( [ 4 ], doc.root ),
					'y',
					doc.version ) );
			} ).to.throw( CKEditorError, /operation-move-node-does-not-exists/ );
		} );
	}
} );