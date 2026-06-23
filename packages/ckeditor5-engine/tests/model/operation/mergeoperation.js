/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { MergeOperation } from '../../../src/model/operation/mergeoperation.js';
import { SplitOperation } from '../../../src/model/operation/splitoperation.js';
import { ModelPosition } from '../../../src/model/position.js';
import { ModelElement } from '../../../src/model/element.js';
import { ModelText } from '../../../src/model/text.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MergeOperation', () => {
	let model, doc, root, gy, gyPos;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		gy = doc.graveyard;
		gyPos = new ModelPosition( gy, [ 0 ] );
	} );

	it( 'should have proper type', () => {
		const merge = new MergeOperation( new ModelPosition( root, [ 1, 0 ] ), 2, new ModelPosition( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.type ).toBe( 'merge' );
	} );

	it( 'should have proper deletionPosition', () => {
		const merge = new MergeOperation( new ModelPosition( root, [ 1, 0 ] ), 2, new ModelPosition( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.deletionPosition.path ).toEqual( [ 1 ] );
	} );

	it( 'should have proper movedRange', () => {
		const merge = new MergeOperation( new ModelPosition( root, [ 1, 0 ] ), 2, new ModelPosition( root, [ 0, 1 ] ), gyPos, 1 );

		expect( merge.movedRange.start.path ).toEqual( [ 1, 0 ] );
		expect( merge.movedRange.end.path ).toEqual( [ 1, Number.POSITIVE_INFINITY ] );
	} );

	it( 'should merge two nodes together', () => {
		const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
		const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

		root._insertChild( 0, [ p1, p2 ] );

		model.applyOperation(
			new MergeOperation(
				new ModelPosition( root, [ 1, 0 ] ),
				3,
				new ModelPosition( root, [ 0, 3 ] ),
				gyPos,
				doc.version
			)
		);

		expect( doc.version ).toBe( 1 );
		expect( root.maxOffset ).toBe( 1 );
		expect( root.getChild( 0 ).name ).toBe( 'p1' );
		expect( p1.maxOffset ).toBe( 6 );
		expect( p1.getChild( 0 ).data ).toBe( 'Foobar' );
	} );

	it( 'should create a proper SplitOperation as a reverse', () => {
		const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
		const targetPosition = new ModelPosition( root, [ 0, 3 ] );

		const operation = new MergeOperation( sourcePosition, 2, targetPosition, gyPos, doc.version );
		const reverse = operation.getReversed();

		expect( reverse ).toBeInstanceOf( SplitOperation );
		expect( reverse.baseVersion ).toBe( 1 );
		expect( reverse.howMany ).toBe( 2 );
		expect( reverse.splitPosition.isEqual( targetPosition ) ).toBe( true );
		expect( reverse.insertionPosition.isEqual( new ModelPosition( root, [ 1 ] ) ) ).toBe( true );
		expect( reverse.graveyardPosition.isEqual( gyPos ) ).toBe( true );
	} );

	it( 'should undo merge by applying reverse operation', () => {
		const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
		const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

		root._insertChild( 0, [ p1, p2 ] );

		const operation = new MergeOperation(
			new ModelPosition( root, [ 1, 0 ] ),
			3,
			new ModelPosition( root, [ 0, 3 ] ),
			gyPos,
			doc.version
		);

		model.applyOperation( operation );
		model.applyOperation( operation.getReversed() );

		expect( doc.version ).toBe( 2 );
		expect( root.maxOffset ).toBe( 2 );
		expect( p1.maxOffset ).toBe( 3 );
		expect( p1.getChild( 0 ).data ).toBe( 'Foo' );
		expect( p2.maxOffset ).toBe( 3 );
		expect( p2.getChild( 0 ).data ).toBe( 'bar' );
	} );

	describe( '_validate()', () => {
		it( 'should throw an error if source position is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
			const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new ModelPosition( root, [ 0, 3 ] ),
				3,
				new ModelPosition( root, [ 2, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if source position is in root', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
			const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new ModelPosition( root, [ 0 ] ),
				3,
				new ModelPosition( root, [ 0, 3 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-source-position-invalid/, model );
		} );

		it( 'should throw an error if target position is in root', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
			const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new ModelPosition( root, [ 0, 3 ] ),
				3,
				new ModelPosition( root, [ 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-target-position-invalid/, model );
		} );

		it( 'should throw an error if target position is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
			const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new ModelPosition( root, [ 2, 3 ] ),
				3,
				new ModelPosition( root, [ 1, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /model-position-path-incorrect/, model );
		} );

		it( 'should throw an error if number of nodes to move is invalid', () => {
			const p1 = new ModelElement( 'p1', null, new ModelText( 'Foo' ) );
			const p2 = new ModelElement( 'p2', null, new ModelText( 'bar' ) );

			root._insertChild( 0, [ p1, p2 ] );

			const operation = new MergeOperation(
				new ModelPosition( root, [ 0, 3 ] ),
				5,
				new ModelPosition( root, [ 1, 0 ] ),
				gyPos,
				doc.version
			);

			expectToThrowCKEditorError( () => operation._validate(), /merge-operation-how-many-invalid/, model );
		} );
	} );

	it( 'should create MergeOperation with the same parameters when cloned', () => {
		const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
		const targetPosition = new ModelPosition( root, [ 0, 3 ] );
		const howMany = 4;
		const baseVersion = doc.version;

		const op = new MergeOperation( sourcePosition, howMany, targetPosition, gyPos, baseVersion );

		const clone = op.clone();

		// New instance rather than a pointer to the old instance.
		expect( clone ).not.toBe( op );

		expect( clone ).toBeInstanceOf( MergeOperation );
		expect( clone.sourcePosition.isEqual( sourcePosition ) ).toBe( true );
		expect( clone.targetPosition.isEqual( targetPosition ) ).toBe( true );
		expect( clone.howMany ).toBe( howMany );
		expect( clone.graveyardPosition.isEqual( gyPos ) ).toBe( true );
		expect( clone.baseVersion ).toBe( baseVersion );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
			const targetPosition = new ModelPosition( root, [ 0, 3 ] );
			const op = new MergeOperation( sourcePosition, 1, targetPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'MergeOperation',
				baseVersion: 0,
				howMany: 1,
				sourcePosition: op.sourcePosition.toJSON(),
				targetPosition: op.targetPosition.toJSON(),
				graveyardPosition: gyPos.toJSON()
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MergeOperation from json object', () => {
			const sourcePosition = new ModelPosition( root, [ 1, 0 ] );
			const targetPosition = new ModelPosition( root, [ 0, 3 ] );
			const op = new MergeOperation( sourcePosition, 1, targetPosition, gyPos, doc.version );

			const serialized = op.toJSON();

			const deserialized = MergeOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
