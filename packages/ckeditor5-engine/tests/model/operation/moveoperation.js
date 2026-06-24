/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { MoveOperation } from '../../../src/model/operation/moveoperation.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MoveOperation', () => {
	let model, doc, root, gy;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
	} );

	it( 'should have proper type', () => {
		const move = new MoveOperation( new ModelPosition( root, [ 0, 0 ] ), 1, new ModelPosition( root, [ 1, 0 ] ), 0 );
		expect( move.type ).toBe( 'move' );

		const remove1 = new MoveOperation( new ModelPosition( root, [ 0, 0 ] ), 1, new ModelPosition( gy, [ 0 ] ), 0 );
		expect( remove1.type ).toBe( 'remove' );

		const remove2 = new MoveOperation( new ModelPosition( gy, [ 0 ] ), 1, new ModelPosition( gy, [ 1 ] ), 0 );
		expect( remove2.type ).toBe( 'move' );

		const reinsert = new MoveOperation( new ModelPosition( gy, [ 0 ] ), 1, new ModelPosition( root, [ 0, 0 ] ), 0 );
		expect( reinsert.type ).toBe( 'reinsert' );
	} );

	it( 'should move from one node to another', () => {
		const p1 = new ModelElement( 'p1', [], new ModelElement( 'x' ) );
		const p2 = new ModelElement( 'p2' );

		root._insertChild( 0, [ p1, p2 ] );

		model.applyOperation(
			new MoveOperation(
				new ModelPosition( root, [ 0, 0 ] ),
				1,
				new ModelPosition( root, [ 1, 0 ] ),
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 2 );
		expect( root.getChild( 0 ).name ).toBe( 'p1' );
		expect( root.getChild( 1 ).name ).toBe( 'p2' );
		expect( p1.maxOffset ).toBe( 0 );
		expect( p2.maxOffset ).toBe( 1 );
		expect( p2.getChild( 0 ).name ).toBe( 'x' );
	} );

	it( 'should move position of children in one node backward', () => {
		root._insertChild( 0, new ModelText( 'xbarx' ) );

		model.applyOperation(
			new MoveOperation(
				new ModelPosition( root, [ 2 ] ),
				2,
				new ModelPosition( root, [ 1 ] ),
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 5 );
		expect( root.getChild( 0 ).data ).toBe( 'xarbx' );
	} );

	it( 'should move position of children in one node forward', () => {
		root._insertChild( 0, new ModelText( 'xbarx' ) );

		model.applyOperation(
			new MoveOperation(
				new ModelPosition( root, [ 1 ] ),
				2,
				new ModelPosition( root, [ 4 ] ),
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 5 );
		expect( root.getChild( 0 ).data ).toBe( 'xrbax' );
	} );

	it( 'should create a proper MoveOperation as a reverse', () => {
		const sourcePosition = new ModelPosition( root, [ 0 ] );
		const targetPosition = new ModelPosition( root, [ 4 ] );

		let operation = new MoveOperation( sourcePosition, 3, targetPosition, doc.version );
		let reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( MoveOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.howMany ).toBe( 3 );
		expect( reverse.sourcePosition.path ).toEqual( [ 1 ] );
		expect( reverse.targetPosition.path ).toEqual( [ 0 ] );

		operation = new MoveOperation( targetPosition, 3, sourcePosition, doc.version );
		reverse = operation.getReversed();

		expect( reverse.sourcePosition.path ).toEqual( [ 0 ] );
		expect( reverse.targetPosition.path ).toEqual( [ 7 ] );
	} );

	it( 'should undo move node by applying reverse operation', () => {
		const p1 = new ModelElement( 'p1', [], new ModelElement( 'x' ) );
		const p2 = new ModelElement( 'p2' );

		root._insertChild( 0, [ p1, p2 ] );

		const operation = new MoveOperation(
			new ModelPosition( root, [ 0, 0 ] ),
			1,
			new ModelPosition( root, [ 1, 0 ] ),
			doc.version
		);

		model.applyOperation( operation );

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 2 );
		expect( p1.maxOffset ).toBe( 0 );
		expect( p2.maxOffset ).toBe( 1 );
		expect( p2.getChild( 0 ).name ).toBe( 'x' );

		model.applyOperation( operation.getReversed() );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 2 );
		expect( p1.maxOffset ).toBe( 1 );
		expect( p1.getChild( 0 ).name ).toBe( 'x' );
		expect( p2.maxOffset ).toBe( 0 );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if number of nodes to move exceeds the number of existing nodes in given element', () => {
			root._insertChild( 0, new ModelText( 'xbarx' ) );

			const operation = new MoveOperation(
				new ModelPosition( root, [ 3 ] ),
				3,
				new ModelPosition( root, [ 1 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-nodes-do-not-exist/, model );
		} );

		it( 'should throw an error if target or source parent-element specified by position does not exist', () => {
			const p = new ModelElement( 'p' );
			p._insertChild( 0, new ModelText( 'foo' ) );
			root._insertChild( 0, [ new ModelText( 'ab' ), p ] );

			const operation = new MoveOperation(
				new ModelPosition( root, [ 2, 0 ] ),
				3,
				new ModelPosition( root, [ 1 ] ),
				doc.version
			);

			root._removeChildren( 1 );

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if operation tries to move a range between the beginning and the end of that range', () => {
			root._insertChild( 0, new ModelText( 'xbarx' ) );

			const operation = new MoveOperation(
				new ModelPosition( root, [ 1 ] ),
				3,
				new ModelPosition( root, [ 2 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-range-into-itself/, model );
		} );

		it( 'should throw an error if operation tries to move a range into a sub-tree of a node that is in that range', () => {
			const p = new ModelElement( 'p', [], [ new ModelElement( 'p' ) ] );
			root._insertChild( 0, [ new ModelText( 'ab' ), p, new ModelText( 'xy' ) ] );

			const operation = new MoveOperation(
				new ModelPosition( root, [ 1 ] ),
				3,
				new ModelPosition( root, [ 2, 0, 0 ] ),
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /move-operation-node-into-itself/, model );
		} );

		it( 'should not throw an error if operation move a range into a sibling', () => {
			const p = new ModelElement( 'p' );
			root._insertChild( 0, [ new ModelText( 'ab' ), p, new ModelText( 'xy' ) ] );

			const operation = new MoveOperation(
				new ModelPosition( root, [ 1 ] ),
				1,
				new ModelPosition( root, [ 2, 0 ] ),
				doc.version
			);

			expect( () => operation._validate() ).not.toThrow();
		} );

		it( 'should not throw when operation paths looks like incorrect but move is between different roots', () => {
			const p = new ModelElement( 'p' );
			root._insertChild( 0, [ new ModelText( 'a' ), p, new ModelText( 'b' ) ] );
			doc.graveyard._insertChild( 0, new ModelText( 'abc' ) );

			const operation = new MoveOperation(
				new ModelPosition( doc.graveyard, [ 0 ] ),
				2,
				new ModelPosition( root, [ 1, 0 ] ),
				doc.version
			);

			expect( () => operation._validate() ).not.toThrow();
		} );
	} );

	it( 'should create MoveOperation with the same parameters when cloned', () => {
		const sourcePosition = new ModelPosition( root, [ 0 ] );
		const targetPosition = new ModelPosition( root, [ 1 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( MoveOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).toBe( true );
		expect( clone.targetPosition.isEqual( targetPosition ) ).toBe( true );
		expect( clone.howMany ).toBe( howMany );
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	describe( 'getMovedRangeStart', () => {
		it( 'should return move operation target position transformed by removing move operation source range', () => {
			const sourcePosition = new ModelPosition( root, [ 0, 2 ] );
			const targetPosition = new ModelPosition( root, [ 0, 6 ] );
			const howMany = 3;
			const baseVersion = doc.version;

			const op = new MoveOperation( sourcePosition, howMany, targetPosition, baseVersion );

			expect( op.getMovedRangeStart().path ).toEqual( [ 0, 3 ] );
		} );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const sourcePosition = new ModelPosition( root, [ 0, 0 ] );
			const targetPosition = new ModelPosition( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'MoveOperation',
				baseVersion: 0,
				howMany: 1,
				sourcePosition: op.sourcePosition.toJSON(),
				targetPosition: op.targetPosition.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MoveOperation from json object', () => {
			const sourcePosition = new ModelPosition( root, [ 0, 0 ] );
			const targetPosition = new ModelPosition( root, [ 1, 0 ] );
			const op = new MoveOperation( sourcePosition, 1, targetPosition, doc.version );

			const serialized = op.toJSON();
			const deserialized = MoveOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
