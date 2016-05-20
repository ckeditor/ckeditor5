/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel, operation */

'use strict';

import Document from '/ckeditor5/engine/treemodel/document.js';
import Node from '/ckeditor5/engine/treemodel/node.js';
import NodeList from '/ckeditor5/engine/treemodel/nodelist.js';
import InsertOperation from '/ckeditor5/engine/treemodel/operation/insertoperation.js';
import RemoveOperation from '/ckeditor5/engine/treemodel/operation/removeoperation.js';
import Position from '/ckeditor5/engine/treemodel/position.js';
import Text from '/ckeditor5/engine/treemodel/text.js';
import { jsonParseStringify } from '/tests/engine/treemodel/_utils/utils.js';

describe( 'InsertOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot( 'root' );
	} );

	it( 'should have proper type', () => {
		const op = new InsertOperation(
			new Position( root, [ 0 ] ),
			new Text( 'x' ),
			doc.version
		);

		expect( op.type ).to.equal( 'insert' );
	} );

	it( 'should insert node', () => {
		doc.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				new Text( 'x' ),
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
				[ 'foo', new Text( 'x' ), 'bar' ],
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
			[ 'foo', new Text( 'x' ), 'bar' ],
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
			new Text( 'x' ),
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

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = new Position( root, [ 0 ] );
			const op = new InsertOperation( position, new Text( 'x' ), doc.version );

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.treeModel.operation.InsertOperation',
				baseVersion: 0,
				nodeList: jsonParseStringify( new NodeList( 'x' ) ),
				position: jsonParseStringify( position )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper InsertOperation from json object', () => {
			const position = new Position( root, [ 0 ] );
			const op = new InsertOperation( position, new Text( 'x' ), doc.version );

			const serialized = jsonParseStringify( op );
			const deserialized = InsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
