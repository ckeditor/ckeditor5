/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */
/* global describe, before, beforeEach, it, expect */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/node',
	'core/treemodel/nodelist',
	'core/treemodel/operation/insertoperation',
	'core/treemodel/operation/removeoperation',
	'core/treemodel/position',
	'core/treemodel/character',
	'core/treemodel/nodelist'
);

describe( 'InsertOperation', () => {
	let Document, Node, NodeList, InsertOperation, RemoveOperation, Position, Character;

	before( () => {
		Document = modules[ 'core/treemodel/document' ];
		Node = modules[ 'core/treemodel/node' ];
		NodeList = modules[ 'core/treemodel/nodelist' ];
		InsertOperation = modules[ 'core/treemodel/operation/insertoperation' ];
		RemoveOperation = modules[ 'core/treemodel/operation/removeoperation' ];
		Position = modules[ 'core/treemodel/position' ];
		Character = modules[ 'core/treemodel/character' ];
	} );

	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should have proper type', () => {
		const op = new InsertOperation(
			new Position( root, [ 0 ] ),
			new Character( 'x' ),
			doc.version
		);

		expect( op.type ).to.equal( 'insert' );
	} );

	it( 'should insert node', () => {
		doc.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
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
				new Position( root, [ 0 ] ),
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
				new Position( root, [ 1 ] ),
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
				new Position( root, [ 0 ] ),
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

	it( 'should create a RemoveOperation as a reverse', () => {
		let position = new Position( root, [ 0 ] );
		let operation = new InsertOperation(
			position,
			[ 'foo', new Character( 'x' ), 'bar' ],
			0
		);

		let reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.sourcePosition.isEqual( position ) ).to.be.true;
		expect( reverse.howMany ).to.equal( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', () => {
		let operation = new InsertOperation(
			new Position( root, [ 0 ] ),
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
			new Position( root, [ 0 ] ),
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

	it( 'should create operation with the same parameters when cloned', () => {
		let position = new Position( root, [ 0 ] );
		let nodeA = new Node();
		let nodeB = new Node();
		let nodes = new NodeList( [ nodeA, nodeB ] );
		let baseVersion = doc.version;

		let op = new InsertOperation( position, nodes, baseVersion );

		let clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( InsertOperation );
		expect( clone.position.isEqual( position ) ).to.be.true;
		expect( clone.nodeList.get( 0 ) ).to.equal( nodeA );
		expect( clone.nodeList.get( 1 ) ).to.equal( nodeB );
		expect( clone.nodeList.length ).to.equal( 2 );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );
} );
