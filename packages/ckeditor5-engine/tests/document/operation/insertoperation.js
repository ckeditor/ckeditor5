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

describe( 'InsertOperation', () => {
	let Document, InsertOperation, RemoveOperation, Position, Character;

	before( () => {
		Document = modules[ 'document/document' ];
		InsertOperation = modules[ 'document/operation/insertoperation' ];
		RemoveOperation = modules[ 'document/operation/removeoperation' ];
		Position = modules[ 'document/position' ];
		Character = modules[ 'document/character' ];
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should insert node', () => {
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

	it( 'should insert set of nodes', () => {
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

	it( 'should insert between existing nodes', () => {
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

	it( 'should insert text', () => {
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

	it( 'should create a remove operation as a reverse', () => {
		let position = new Position( [ 0 ], root );
		let operation = new InsertOperation(
			position,
			[ 'foo', new Character( 'x' ), 'bar' ],
			0
		);

		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.sourcePosition ).to.equal( position );
		expect( reverse.howMany ).to.equal( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', () => {
		let operation = new InsertOperation(
			new Position( [ 0 ], root ),
			new Character( 'x' ),
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', () => {
		let operation = new InsertOperation(
			new Position( [ 0 ], root ),
			'bar',
			doc.version
		);

		let reverse = operation.getReversed();

		doc.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( reverse );

		expect( doc.version ).to.equal( 2 );
		expect( root.getChildCount() ).to.equal( 0 );
	} );
} );
