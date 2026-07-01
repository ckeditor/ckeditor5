/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelNodeList } from '../../../src/model/nodelist.js';
import { ModelElement } from '../../../src/model/element.js';
import { InsertOperation } from '../../../src/model/operation/insertoperation.js';
import { MoveOperation } from '../../../src/model/operation/moveoperation.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelText } from '../../../src/model/text.js';
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
			new ModelPosition( root, [ 0 ] ),
			new ModelText( 'x' ),
			doc.version
		);

		expect( op.type ).toBe( 'insert' );
	} );

	it( 'should have proper position stickiness', () => {
		const pos = new ModelPosition( root, [ 0 ] );
		pos.stickiness = 'toNext';

		const op = new InsertOperation(
			new ModelPosition( root, [ 0 ] ),
			new ModelText( 'x' ),
			doc.version
		);

		expect( op.position.stickiness ).toBe( 'toNone' );
	} );

	it( 'should insert text node', () => {
		model.applyOperation(
			new InsertOperation(
				new ModelPosition( root, [ 0 ] ),
				new ModelText( 'x' ),
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( root.getChild( 0 ).data ).toBe( 'x' );
	} );

	it( 'should insert element', () => {
		model.applyOperation(
			new InsertOperation(
				new ModelPosition( root, [ 0 ] ),
				new ModelElement( 'p' ),
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( root.getChild( 0 ).name ).toBe( 'p' );
	} );

	it( 'should insert set of nodes', () => {
		model.applyOperation(
			new InsertOperation(
				new ModelPosition( root, [ 0 ] ),
				[ 'bar', new ModelElement( 'p' ), 'foo' ],
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 7 );
		expect( root.childCount ).toBe( 3 );
		expect( root.getChild( 0 ).data ).toBe( 'bar' );
		expect( root.getChild( 1 ).name ).toBe( 'p' );
		expect( root.getChild( 2 ).data ).toBe( 'foo' );
	} );

	it( 'should return position on affectedSelectable', () => {
		const pos = new ModelPosition( root, [ 1 ] );
		const op = new InsertOperation( pos, 'bar',	doc.version );
		expect( op.affectedSelectable ).toEqual( pos );
	} );

	it( 'should insert between existing nodes', () => {
		root._insertChild( 0, new ModelText( 'xy' ) );

		model.applyOperation(
			new InsertOperation(
				new ModelPosition( root, [ 1 ] ),
				'bar',
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 5 );
		expect( root.getChild( 0 ).data ).toBe( 'xbary' );
	} );

	it( 'should insert text', () => {
		model.applyOperation(
			new InsertOperation(
				new ModelPosition( root, [ 0 ] ),
				[ 'foo', new ModelText( 'x' ), 'bar' ],
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 7 );
		expect( root.getChild( 0 ).data ).toBe( 'fooxbar' );
	} );

	it( 'should create a MoveOperation as a reverse', () => {
		const position = new ModelPosition( root, [ 0 ] );
		const operation = new InsertOperation(
			position,
			[ 'foo', new ModelText( 'x' ), 'bar' ],
			0
		);

		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( MoveOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.sourcePosition.isEqual( position ) ).toBe( true );
		expect( reverse.howMany ).toBe( 7 );
	} );

	it( 'should undo insert node by applying reverse operation', () => {
		const operation = new InsertOperation(
			new ModelPosition( root, [ 0 ] ),
			new ModelText( 'x' ),
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );

		expect( doc.version ).toBe( 1 );

		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 0 );
	} );

	it( 'should undo insert set of nodes by applying reverse operation', () => {
		const operation = new InsertOperation(
			new ModelPosition( root, [ 0 ] ),
			'bar',
			doc.version
		);

		const reverse = operation.getReversed();

		model.applyOperation( operation );

		expect( doc.version ).toBe( 1 );

		model.applyOperation( reverse );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 0 );
	} );

	it( 'should create operation with the same parameters when cloned', () => {
		const position = new ModelPosition( root, [ 0 ] );
		const nodeA = new ModelElement( 'a' );
		const nodeB = new ModelElement( 'b' );
		const nodes = [ nodeA, nodeB ];
		const baseVersion = doc.version;

		const op = new InsertOperation( position, nodes, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( InsertOperation );
		expect( clone.position.isEqual( position ) ).toBe( true );

		// New node, not pointer to the old instance.
		expect( clone.nodes.getNode( 0 ) ).not.toBe( nodeA );
		expect( clone.nodes.getNode( 1 ) ).not.toBe( nodeB );
		expect( clone.nodes.getNode( 0 ) ).toEqual( nodeA );
		expect( clone.nodes.getNode( 1 ) ).toEqual( nodeB );

		expect( clone.nodes.length ).toBe( 2 );
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	it( 'should save copies of inserted nodes after it is executed', () => {
		const element = new ModelElement( 'p', { key: 'value' } );

		const op = new InsertOperation( new ModelPosition( root, [ 0 ] ), element, doc.version );
		model.applyOperation( op );

		const text = new ModelText( 'text' );
		const op2 = new InsertOperation( new ModelPosition( root, [ 0, 0 ] ), text, doc.version );
		model.applyOperation( op2 );

		expect( op.nodes.getNode( 0 ) ).not.toBe( element );
		expect( op.nodes.getNode( 0 ).name ).toBe( 'p' );
		expect( Array.from( op.nodes.getNode( 0 ).getAttributes() ) ).toEqual( [ [ 'key', 'value' ] ] );

		expect( op.nodes.getNode( 0 ).childCount ).toBe( 0 );
		expect( element.childCount ).toBe( 1 );

		expect( op2.nodes.getNode( 0 ) ).not.toBe( text );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if target position does not exist', () => {
			const element = new ModelElement( 'p' );
			const op = new InsertOperation( new ModelPosition( root, [ 4 ] ), element, doc.version );

			expectToThrowCKEditorError( () => op._validate(), /insert-operation-position-invalid/, model );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = new ModelPosition( root, [ 0 ] );
			const op = new InsertOperation( position, new ModelText( 'x' ), doc.version );
			op.shouldReceiveAttributes = true;

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'InsertOperation',
				baseVersion: 0,
				nodes: ( new ModelNodeList( [ new ModelText( 'x' ) ] ) ).toJSON(),
				position: position.toJSON(),
				shouldReceiveAttributes: true
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper InsertOperation from json object', () => {
			const position = new ModelPosition( root, [ 0 ] );
			const op = new InsertOperation(
				position,
				[ new ModelText( 'x' ), new ModelElement( 'p', [], new ModelText( 'foo' ) ), 'y' ],
				doc.version
			);

			const serialized = op.toJSON();
			const deserialized = InsertOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
