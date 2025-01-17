/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Model from '../../../src/model/model.js';
import NodeList from '../../../src/model/nodelist.js';
import Element from '../../../src/model/element.js';
import InsertOperation from '../../../src/model/operation/insertoperation.js';
import MoveOperation from '../../../src/model/operation/moveoperation.js';
import Position from '../../../src/model/position.js';
import Text from '../../../src/model/text.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'InsertOperation', () => {
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
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

	it( 'should have proper position stickiness', () => {
		const pos = new Position( root, [ 0 ] );
		pos.stickiness = 'toNext';

		const op = new InsertOperation(
			new Position( root, [ 0 ] ),
			new Text( 'x' ),
			doc.version
		);

		expect( op.position.stickiness ).to.equal( 'toNone' );
	} );

	it( 'should insert text node', () => {
		model.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				new Text( 'x' ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).data ).to.equal( 'x' );
	} );

	it( 'should insert element', () => {
		model.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				new Element( 'p' ),
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 1 );
		expect( root.getChild( 0 ).name ).to.equal( 'p' );
	} );

	it( 'should insert set of nodes', () => {
		model.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				[ 'bar', new Element( 'p' ), 'foo' ],
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 7 );
		expect( root.childCount ).to.equal( 3 );
		expect( root.getChild( 0 ).data ).to.equal( 'bar' );
		expect( root.getChild( 1 ).name ).to.equal( 'p' );
		expect( root.getChild( 2 ).data ).to.equal( 'foo' );
	} );

	it( 'should return position on affectedSelectable', () => {
		const pos = new Position( root, [ 1 ] );
		const op = new InsertOperation( pos, 'bar',	doc.version );
		expect( op.affectedSelectable ).to.deep.equal( pos );
	} );

	it( 'should insert between existing nodes', () => {
		root._insertChild( 0, new Text( 'xy' ) );

		model.applyOperation(
			new InsertOperation(
				new Position( root, [ 1 ] ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 5 );
		expect( root.getChild( 0 ).data ).to.equal( 'xbary' );
	} );

	it( 'should insert text', () => {
		model.applyOperation(
			new InsertOperation(
				new Position( root, [ 0 ] ),
				[ 'foo', new Text( 'x' ), 'bar' ],
				doc.version
			)
		);

		expect( doc.version ).to.equal( 1 );
		expect( root.maxOffset ).to.equal( 7 );
		expect( root.getChild( 0 ).data ).to.equal( 'fooxbar' );
	} );

	it( 'should create a MoveOperation as a reverse', () => {
		const position = new Position( root, [ 0 ] );
		const operation = new InsertOperation(
			position,
			[ 'foo', new Text( 'x' ), 'bar' ],
			0
		);

		const reverse = operation.getReversed();

		expect( reverse ).to.be.an.instanceof( MoveOperation );
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

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		model.applyOperation( reverse );

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

		model.applyOperation( operation );

		expect( doc.version ).to.equal( 1 );

		model.applyOperation( reverse );

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
		expect( clone ).not.to.equal( op );

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
		model.applyOperation( op );

		const text = new Text( 'text' );
		const op2 = new InsertOperation( new Position( root, [ 0, 0 ] ), text, doc.version );
		model.applyOperation( op2 );

		expect( op.nodes.getNode( 0 ) ).not.to.equal( element );
		expect( op.nodes.getNode( 0 ).name ).to.equal( 'p' );
		expect( Array.from( op.nodes.getNode( 0 ).getAttributes() ) ).to.deep.equal( [ [ 'key', 'value' ] ] );

		expect( op.nodes.getNode( 0 ).childCount ).to.equal( 0 );
		expect( element.childCount ).to.equal( 1 );

		expect( op2.nodes.getNode( 0 ) ).not.to.equal( text );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if target position does not exist', () => {
			const element = new Element( 'p' );
			const op = new InsertOperation( new Position( root, [ 4 ] ), element, doc.version );

			expectToThrowCKEditorError( () => op._validate(), /insert-operation-position-invalid/, model );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = new Position( root, [ 0 ] );
			const op = new InsertOperation( position, new Text( 'x' ), doc.version );
			op.shouldReceiveAttributes = true;

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'InsertOperation',
				baseVersion: 0,
				nodes: ( new NodeList( [ new Text( 'x' ) ] ) ).toJSON(),
				position: position.toJSON(),
				shouldReceiveAttributes: true
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

			const serialized = op.toJSON();
			const deserialized = InsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
