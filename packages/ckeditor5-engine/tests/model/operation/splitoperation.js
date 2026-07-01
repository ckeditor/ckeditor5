/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { SplitOperation } from '../../../src/model/operation/splitoperation.js';
import { MergeOperation } from '../../../src/model/operation/mergeoperation.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'SplitOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new ModelPosition( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, null, 1 );

		expect( split.type ).toBe( 'split' );
	} );

	it( 'should have proper insertionPosition', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, null, 1 );

		expect( split.insertionPosition.path ).toEqual( [ 2 ] );
	} );

	it( 'should have proper moveTargetPosition', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, null, 1 );

		expect( split.moveTargetPosition.path ).toEqual( [ 2, 0 ] );
	} );

	it( 'should have proper movedRange', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, null, 1 );

		expect( split.movedRange.start.path ).toEqual( [ 1, 3 ] );
		expect( split.movedRange.end.path ).toEqual( [ 1, Number.POSITIVE_INFINITY ] );
	} );

	it( 'should include graveyard range in affectedSelectable when graveyardPosition is set', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, gyPos, 1 );

		const selectable = split.affectedSelectable;

		expect( selectable ).toHaveLength( 3 );
	} );

	it( 'should include only 2 ranges in affectedSelectable when graveyardPosition is not set', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const split = new SplitOperation( splitPosition, 2, insertionPosition, null, 1 );

		const selectable = split.affectedSelectable;

		expect( selectable ).toHaveLength( 2 );
	} );

	it( 'should split an element', () => {
		const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

		root._insertChild( 0, [ p1 ] );

		const splitPosition = new ModelPosition( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		model.applyOperation( new SplitOperation( splitPosition, 3, insertionPosition, null, doc.version ) );

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 2 );
		expect( root.getChild( 0 ).name ).toBe( 'p1' );
		expect( root.getChild( 1 ).name ).toBe( 'p1' );

		expect( p1.maxOffset ).toBe( 3 );
		expect( p1.getChild( 0 ).data ).toBe( 'Foo' );

		expect( root.getChild( 1 ).maxOffset ).toBe( 3 );
		expect( root.getChild( 1 ).getChild( 0 ).data ).toBe( 'bar' );
	} );

	it( 'should split an element using graveyard element', () => {
		const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );
		const p2 = new ModelElement( 'p2' );

		root._insertChild( 0, [ p1 ] );
		gy._insertChild( 0, [ p2 ] );

		const splitPosition = new ModelPosition( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		model.applyOperation( new SplitOperation( splitPosition, 3, insertionPosition, gyPos, doc.version ) );

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 2 );
		expect( root.getChild( 0 ).name ).toBe( 'p1' );
		expect( root.getChild( 1 ).name ).toBe( 'p2' );

		expect( p1.maxOffset ).toBe( 3 );
		expect( p1.getChild( 0 ).data ).toBe( 'Foo' );

		expect( root.getChild( 1 ).maxOffset ).toBe( 3 );
		expect( root.getChild( 1 ).getChild( 0 ).data ).toBe( 'bar' );

		expect( gy.maxOffset ).toBe( 0 );
	} );

	it( 'should create a proper MergeOperation as a reverse', () => {
		const splitPosition = new ModelPosition( root, [ 1, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const operation = new SplitOperation( splitPosition, 3, insertionPosition, null, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( MergeOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.howMany ).toBe( 3 );
		expect( reverse.sourcePosition.isEqual( new ModelPosition( root, [ 2, 0 ] ) ) ).toBe( true );
		expect( reverse.targetPosition.isEqual( new ModelPosition( root, [ 1, 3 ] ) ) ).toBe( true );
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).toBe( true );
	} );

	it( 'should undo split by applying reverse operation', () => {
		const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

		root._insertChild( 0, [ p1 ] );

		const splitPosition = new ModelPosition( root, [ 0, 3 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

		const operation = new SplitOperation( splitPosition, 3, insertionPosition, null, doc.version );

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 1 );
		expect( p1.maxOffset ).toBe( 6 );
		expect( p1.getChild( 0 ).data ).toBe( 'Foobar' );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if split position is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const splitPosition = new ModelPosition( root, [ 0, 8 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

			const operation = new SplitOperation( splitPosition, 3, insertionPosition, null, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-position-invalid/, model );
		} );

		it( 'should throw an error if split position is in root', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const splitPosition = new ModelPosition( root, [ 0, 0 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

			const operation = new SplitOperation( splitPosition, 3, insertionPosition, null, doc.version );
			operation.splitPosition = new ModelPosition( root, [ 1 ] );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-split-in-root/, model );
		} );

		it( 'should throw an error if number of nodes to move is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const splitPosition = new ModelPosition( root, [ 0, 2 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

			const operation = new SplitOperation( splitPosition, 6, insertionPosition, null, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-how-many-invalid/, model );
		} );

		it( 'should throw an error if graveyard position is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foobar' ) );

			root._insertChild( 0, [ p1 ] );

			const splitPosition = new ModelPosition( root, [ 0, 2 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( splitPosition );

			const operation = new SplitOperation( splitPosition, 4, insertionPosition, gyPos, doc.version );

			expectToThrowCKEditorError( () => operation._validate(), /split-operation-graveyard-position-invalid/, model );
		} );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #1', () => {
		const position = new ModelPosition( root, [ 1, 2 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, insertionPosition, null, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).toBe( true );
		expect( clone.howMany ).toBe( howMany );
		expect( clone.insertionPosition.isEqual( op.insertionPosition ) );
		expect( clone.graveyardPosition ).toBeNull();
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	it( 'should create SplitOperation with the same parameters when cloned #2', () => {
		const position = new ModelPosition( root, [ 1, 2 ] );
		const insertionPosition = SplitOperation.getInsertionPosition( position );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new SplitOperation( position, howMany, insertionPosition, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( SplitOperation );
		expect( clone.splitPosition.isEqual( position ) ).toBe( true );
		expect( clone.howMany ).toBe( howMany );
		expect( clone.insertionPosition.isEqual( op.insertionPosition ) );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).toBe( true );
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object #1', () => {
			const position = new ModelPosition( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, null, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'SplitOperation',
				baseVersion: 0,
				howMany: 2,
				splitPosition: op.splitPosition.toJSON(),
				insertionPosition: op.insertionPosition.toJSON(),
				graveyardPosition: null
			} );
		} );

		it( 'should create proper json object #2', () => {
			const position = new ModelPosition( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'SplitOperation',
				baseVersion: 0,
				howMany: 2,
				splitPosition: op.splitPosition.toJSON(),
				insertionPosition: op.insertionPosition.toJSON(),
				graveyardPosition: op.graveyardPosition.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper SplitOperation from json object #1', () => {
			const position = new ModelPosition( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, null, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );

		it( 'should create proper SplitOperation from json object #2', () => {
			const position = new ModelPosition( root, [ 0, 3 ] );
			const insertionPosition = SplitOperation.getInsertionPosition( position );
			const op = new SplitOperation( position, 2, insertionPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = SplitOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
