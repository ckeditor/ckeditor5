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
	'document/nodelist',
	'ckeditorerror' );

describe( 'RemoveOperation', function() {
	it( 'should remove node', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'x' );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 0 ], doc.root ),
			doc.root.getChild( 0 ),
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 0 );
	} );

	it( 'should remove set of nodes', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'bar' );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 0 ], doc.root ),
			[ doc.root.getChild( 0 ), doc.root.getChild( 1 ), doc.root.getChild( 2 ) ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 0 );
	} );

	it( 'should remove from between existing nodes', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];

		var doc = new Document();

		doc.root.insertChildren( 0, 'bar' );

		doc.applyOperation( new RemoveOperation(
			new Position( [ 1 ], doc.root ),
			[ doc.root.getChild( 1 ) ],
			doc.version ) );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 2 );
		expect( doc.root.getChild( 0 ).character ).to.be.equal( 'b' );
		expect( doc.root.getChild( 1 ).character ).to.be.equal( 'r' );
	} );

	it( 'should create a insert operation as a reverse', function() {
		var Document = modules[ 'document/document' ];
		var InsertOperation = modules[ 'document/insertoperation' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var NodeList = modules[ 'document/nodelist' ];

		var doc = new Document();

		var nodeList = new NodeList( 'bar' );
		var position = new Position( [ 0 ], doc.root );

		doc.root.insertChildren( 0, nodeList );

		var operation = new RemoveOperation( position, nodeList, 0 );

		var reverse = operation.reverseOperation();

		expect( reverse ).to.be.an.instanceof( InsertOperation );
		expect( reverse.baseVersion ).to.equals( 1 );
		expect( reverse.nodeList ).to.equals( nodeList );
		expect( reverse.position ).to.equals( position );
	} );

	it( 'should undo remove set of nodes by applying reverse operation', function() {
		var Document = modules[ 'document/document' ];
		var RemoveOperation = modules[ 'document/removeoperation' ];
		var Position = modules[ 'document/position' ];
		var NodeList = modules[ 'document/nodelist' ];

		var doc = new Document();

		var nodeList = new NodeList( 'bar' );
		var position = new Position( [ 0 ], doc.root );

		doc.root.insertChildren( 0, nodeList );

		var operation = new RemoveOperation( position, nodeList, 0 );

		var reverse = operation.reverseOperation();

		doc.applyOperation( operation );

		expect( doc.version ).to.be.equal( 1 );
		expect( doc.root.getChildCount() ).to.be.equal( 0 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.be.equal( 2 );
		expect( doc.root.getChildCount() ).to.be.equal( 3 );
		expect( doc.root.getChild( 0 ).character ).to.be.equal( 'b' );
		expect( doc.root.getChild( 1 ).character ).to.be.equal( 'a' );
		expect( doc.root.getChild( 2 ).character ).to.be.equal( 'r' );
	}  );

	if ( CKEDITOR.isDebug ) {
		it( 'should throw error if nodes to remove are different then actual nodes', function() {
			var Document = modules[ 'document/document' ];
			var RemoveOperation = modules[ 'document/removeoperation' ];
			var Position = modules[ 'document/position' ];
			var CKEditorError = modules.ckeditorerror;

			var doc = new Document();

			doc.root.insertChildren( 0, 'foo' );

			expect( function() {
				doc.applyOperation( new RemoveOperation(
					new Position( [ 0 ], doc.root ),
					'bar',
					doc.version ) );
			} ).to.throw( CKEditorError, /operation-remove-node-does-not-exists/ );
		} );
	}
} );