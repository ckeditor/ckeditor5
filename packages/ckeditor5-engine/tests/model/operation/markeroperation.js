/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { ModelText } from '../../../src/model/text.js';
import { MarkerOperation } from '../../../src/model/operation/markeroperation.js';

describe( 'MarkerOperation', () => {
	let model, doc, root, range;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		root._appendChild( new ModelText( 'foo' ) );
		range = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 0 ) );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should have property type equal to "marker"', () => {
		const op = new MarkerOperation( 'name', null, range, model.markers, true, 0 );
		expect( op.type ).toBe( 'marker' );
	} );

	it( 'should add marker to document marker collection', () => {
		vi.spyOn( model.markers, '_set' );

		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		expect( doc.version ).toBe( 1 );
		expect( model.markers._set ).toHaveBeenCalled();
		expect( model.markers.get( 'name' ).getRange().isEqual( range ) ).toBe( true );
	} );

	it( 'should update marker in document marker collection', () => {
		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		const range2 = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 3 ) );

		vi.spyOn( model.markers, '_set' );

		model.applyOperation(
			new MarkerOperation( 'name', range, range2, model.markers, true, doc.version )
		);

		expect( doc.version ).toBe( 2 );
		expect( model.markers._set ).toHaveBeenCalled();
		expect( model.markers.get( 'name' ).getRange().isEqual( range2 ) ).toBe( true );
	} );

	it( 'should remove marker from document marker collection', () => {
		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		vi.spyOn( model.markers, '_remove' );

		model.applyOperation(
			new MarkerOperation( 'name', range, null, model.markers, true, doc.version )
		);

		expect( doc.version ).toBe( 2 );
		expect( model.markers._remove ).toHaveBeenCalledWith( 'name' );
		expect( model.markers.get( 'name' ) ).toBe( null );
	} );

	it( 'should not fire document markers remove event if removing non-existing range', () => {
		vi.spyOn( model.markers, 'fire' );

		model.applyOperation(
			new MarkerOperation( 'name', null, null, model.markers, true, doc.version )
		);

		expect( model.markers.fire ).not.toHaveBeenCalled();
	} );

	it( 'should not fire document markers set event if newRange is same as current marker range', () => {
		model.change( writer => {
			writer.addMarker( 'name', { range, usingOperation: true } );
		} );

		vi.spyOn( model.markers, 'fire' );

		model.applyOperation(
			new MarkerOperation( 'name', range, range, model.markers, false, doc.version )
		);

		expect( model.markers.fire ).not.toHaveBeenCalled();
	} );

	it( 'should return MarkerOperation with swapped ranges as reverse operation', () => {
		const range2 = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 3 ) );

		const op1 = new MarkerOperation( 'name', null, range, model.markers, true, doc.version );
		const reversed1 = op1.getReversed();

		const op2 = new MarkerOperation( 'name', range, range2, model.markers, true, doc.version );
		const reversed2 = op2.getReversed();

		expect( reversed1 ).toBeInstanceOf( MarkerOperation );
		expect( reversed2 ).toBeInstanceOf( MarkerOperation );

		expect( reversed1.name ).toBe( 'name' );
		expect( reversed1.oldRange.isEqual( range ) ).toBe( true );
		expect( reversed1.newRange ).toBe( null );
		expect( reversed1.baseVersion ).toBe( 1 );
		expect( reversed1.affectsData ).toBe( true );

		expect( reversed2.name ).toBe( 'name' );
		expect( reversed2.oldRange.isEqual( range2 ) ).toBe( true );
		expect( reversed2.newRange.isEqual( range ) ).toBe( true );
		expect( reversed2.baseVersion ).toBe( 1 );
		expect( reversed2.affectsData ).toBe( true );
	} );

	it( 'should create a MarkerOperation with the same parameters when cloned', () => {
		const op = new MarkerOperation( 'name', null, range, model.markers, true, 0 );
		const clone = op.clone();

		expect( clone ).toBeInstanceOf( MarkerOperation );
		expect( clone ).toEqual( op );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new MarkerOperation( 'name', null, range, model.markers, true, doc.version );
			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'MarkerOperation',
				baseVersion: 0,
				name: 'name',
				oldRange: null,
				newRange: range.toJSON(),
				affectsData: true
			} );
		} );
	} );

	describe( 'fromJSON', () => {
		it( 'should create proper MarkerOperation from json object #1', () => {
			const op = new MarkerOperation( 'name', null, range, model.markers, true, doc.version );

			const serialized = op.toJSON();
			const deserialized = MarkerOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );

		it( 'should create proper MarkerOperation from json object #2', () => {
			// Gotta love 100% CC.
			const op = new MarkerOperation( 'name', range, null, model.markers, true, doc.version );

			const serialized = op.toJSON();
			const deserialized = MarkerOperation.fromJSON( serialized, doc );

			expect( deserialized ).toEqual( op );
		} );
	} );
} );
