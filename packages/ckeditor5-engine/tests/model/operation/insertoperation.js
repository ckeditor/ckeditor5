/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import NodeList from '../../../src/model/nodelist';
import Element from '../../../src/model/element';
import InsertOperation from '../../../src/model/operation/insertoperation';
import RemoveOperation from '../../../src/model/operation/removeoperation';
import Position from '../../../src/model/position';
import Text from '../../../src/model/text';
import { jsonParseStringify, wrapInDelta } from '../../../tests/model/_utils/utils';

describe( 'InsertOperation', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
	} );

	it( 'should have proper type', () => {
		const op = new InsertOperation(
			new Position( root, [ 0 ] ),
			new Text( 'x' ),
			doc.version
		);

		expect( op.type ).to.equal( 'insert' );
	} );

	it( 'should insert text node', () => {
		doc.applyOperation( wrapInDelta(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				new Text( 'x' ),
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).data ).to.equal( 'x' );
	} );

	it( 'should insert element', () => {
		doc.applyOperation( wrapInDelta(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				new Element( 'p' ),
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'p' );
	} );

	it( 'should insert set of nodes', () => {
		doc.applyOperation( wrapInDelta(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				[ 'bar', new Element( 'p' ), 'foo' ],
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 7 );
		expect( root.childCount ).to.equal( 3 );
		expect( root.getChild( 0 ).data ).to.equal( 'bar' );
		expect( root.getChild( 1 ).name ).to.equal( 'p' );
		expect( root.getChild( 2 ).data ).to.equal( 'foo' );
	} );

	it( 'should insert between existing nodes', () => {
		root.insertChildren( 0, new Text( 'xy' ) );

		doc.applyOperation( wrapInDelta(
			new InsertOperation(
				new Position( root, [ 1 ] ),
				'bar',
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xbary' );
	} );

	it( 'should insert text', () => {
		doc.applyOperation( wrapInDelta(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				[ 'foo', new Text( 'x' ), 'bar' ],
				doc.version
			)
		) );

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 7 );
		expect( root.getChild( 0 ).data ).to.equal( 'fooxbar' );
	} );

	it( 'should create a RemoveOperation as a reverse', () => {
		const position = new Position( root, [ 0 ] );
		const operation = new InsertOperation(
			position,
			[ 'foo', new Text( 'x' ), 'bar' ],
			0
		);

		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( RemoveOperation );
		expect( reverse.baseVersion ).to.equal( 1 );
		expect( reverse.sourcePosition.isEqual( position ) ).to.be.true;
		expect( reverse.howMany ).to.equal( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', () => {
		const operation = new InsertOperation(
			new Position( root, [ 0 ] ),
			new Text( 'x' ),
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', () => {
		const operation = new InsertOperation(
			new Position( root, [ 0 ] ),
			'bar',
			doc.version
		);

		const reverse = operation.getReversed();

		doc.applyOperation( wrapInDelta( operation ) );

		expect( doc.version ).to.equal( 1 );

		doc.applyOperation( wrapInDelta( reverse ) );

		expect( doc.version ).to.equal( 2 );
		expect( root.maxOffset ).to.equal( 0 );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		const position = new Position( root, [ 0 ] );
		const nodeA = new Element( 'a' );
		const nodeB = new Element( 'b' );
		const nodes = [ nodeA, nodeB ];
		const baseVersion = doc.version;

		const op = new InsertOperation( position, nodes, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.to.be.equal( op );

		expect( clone ).to.be.instanceof( InsertOperation );
		expect( clone.position.isEqual( position ) ).to.be.true;

		// New node, not pointer to the old instance.
		expect( clone.nodes.getNode( 0 ) ).not.to.equal( nodeA );
		expect( clone.nodes.getNode( 1 ) ).not.to.equal( nodeB );
		expect( clone.nodes.getNode( 0 ) ).to.deep.equal( nodeA );
		expect( clone.nodes.getNode( 1 ) ).to.deep.equal( nodeB );

		expect( clone.nodes.length ).to.equal( 2 );
		expect( clone.baseVersion ).to.equal( baseVersion );
	} );

	it( 'should save copies of inserted nodes after it is executed', () => {
		const element = new Element( 'p', { key: 'value' } );

		const op = new InsertOperation( new Position( root, [ 0 ] ), element, doc.version );
		doc.applyOperation( wrapInDelta( op ) );

		const text = new Text( 'text' );
		const op2 = new InsertOperation( new Position( root, [ 0, 0 ] ), text, doc.version );
		doc.applyOperation( wrapInDelta( op2 ) );

		expect( op.nodes.getNode( 0 ) ).not.to.equal( element );
		expect( op.nodes.getNode( 0 ).name ).to.equal( 'p' );
		expect( Array.from( op.nodes.getNode( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'key', 'value' ] ] );

		expect( op.nodes.getNode( 0 ).childCount ).to.equal( 0 );
		expect( element.childCount ).to.equal( 1 );

		expect( op2.nodes.getNode( 0 ) ).not.to.equal( text );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = new Position( root, [ 0 ] );
			const op = new InsertOperation( position, new Text( 'x' ), doc.version );

			const serialized = jsonParseStringify( op );

			expect( serialized ).to.deep.equal( {
				__className: 'engine.model.operation.InsertOperation',
				baseVersion: 0,
				nodes: jsonParseStringify( new NodeList( [ new Text( 'x' ) ] ) ),
				position: jsonParseStringify( position )
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper InsertOperation from json object', () => {
			const position = new Position( root, [ 0 ] );
			const op = new InsertOperation(
				position,
				[ new Text( 'x' ), new Element( 'p', [], new Text( 'foo' ) ), 'y' ],
				doc.version
			);

			const serialized = jsonParseStringify( op );
			const deserialized = InsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
