/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import Text from '../../../src/model/text';
import MarkerOperation from '../../../src/model/operation/markeroperation';

function matchRange( range ) {
	return sinon.match( rangeToMatch => rangeToMatch.isEqual( range ) );
}

describe( 'MarkerOperation', () => {
	let model, doc, root, range;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		root._appendChild( new Text( 'foo' ) );
		range = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 0 ) );
	} );

	it( 'should have property type equal to "marker"', () => {
		const op = new MarkerOperation( 'name', null, range, model.markers, true, 0 );
		expect( op.type ).to.equal( 'marker' );
	} );

	it( 'should add marker to document marker collection', () => {
		sinon.spy( model.markers, '_set' );

		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		expect( doc.version ).to.equal( 1 );
		expect( model.markers._set.calledWith( 'name', matchRange( range ) ) );
		expect( model.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
	} );

	it( 'should update marker in document marker collection', () => {
		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		const range2 = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 3 ) );

		sinon.spy( model.markers, '_set' );

		model.applyOperation(
			new MarkerOperation( 'name', range, range2, model.markers, true, doc.version )
		);

		expect( doc.version ).to.equal( 2 );
		expect( model.markers._set.calledWith( 'name', matchRange( range2 ) ) );
		expect( model.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
	} );

	it( 'should remove marker from document marker collection', () => {
		model.applyOperation(
			new MarkerOperation( 'name', null, range, model.markers, true, doc.version )
		);

		sinon.spy( model.markers, '_remove' );

		model.applyOperation(
			new MarkerOperation( 'name', range, null, model.markers, true, doc.version )
		);

		expect( doc.version ).to.equal( 2 );
		expect( model.markers._remove.calledWith( 'name' ) );
		expect( model.markers.get( 'name' ) ).to.be.null;
	} );

	it( 'should not fire document markers remove event if removing non-existing range', () => {
		sinon.spy( model.markers, 'fire' );

		model.applyOperation(
			new MarkerOperation( 'name', null, null, model.markers, true, doc.version )
		);

		expect( model.markers.fire.notCalled ).to.be.true;
	} );

	it( 'should not fire document markers set event if newRange is same as current marker range', () => {
		model.change( writer => {
			writer.addMarker( 'name', { range, usingOperation: true } );
		} );

		sinon.spy( model.markers, 'fire' );

		model.applyOperation(
			new MarkerOperation( 'name', range, range, model.markers, false, doc.version )
		);

		expect( model.markers.fire.notCalled ).to.be.true;
	} );

	it( 'should return MarkerOperation with swapped ranges as reverse operation', () => {
		const range2 = model.createRange( model.createPositionAt( root, 0 ), model.createPositionAt( root, 3 ) );

		const op1 = new MarkerOperation( 'name', null, range, model.markers, true, doc.version );
		const reversed1 = op1.getReversed();

		const op2 = new MarkerOperation( 'name', range, range2, model.markers, true, doc.version );
		const reversed2 = op2.getReversed();

		expect( reversed1 ).to.be.an.instanceof( MarkerOperation );
		expect( reversed2 ).to.be.an.instanceof( MarkerOperation );

		expect( reversed1.name ).to.equal( 'name' );
		expect( reversed1.oldRange.isEqual( range ) ).to.be.true;
		expect( reversed1.newRange ).to.be.null;
		expect( reversed1.baseVersion ).to.equal( 1 );
		expect( reversed1.affectsData ).to.be.true;

		expect( reversed2.name ).to.equal( 'name' );
		expect( reversed2.oldRange.isEqual( range2 ) ).to.be.true;
		expect( reversed2.newRange.isEqual( range ) ).to.be.true;
		expect( reversed2.baseVersion ).to.equal( 1 );
		expect( reversed2.affectsData ).to.be.true;
	} );

	it( 'should create a MarkerOperation with the same parameters when cloned', () => {
		const op = new MarkerOperation( 'name', null, range, model.markers, true, 0 );
		const clone = op.clone();

		expect( clone ).to.be.an.instanceof( MarkerOperation );
		expect( clone ).to.deep.equal( op );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper serialized object', () => {
			const op = new MarkerOperation( 'name', null, range, model.markers, true, doc.version );
			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
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

			expect( deserialized ).to.deep.equal( op );
		} );

		it( 'should create proper MarkerOperation from json object #2', () => {
			// Gotta love 100% CC.
			const op = new MarkerOperation( 'name', range, null, model.markers, true, doc.version );

			const serialized = op.toJSON();
			const deserialized = MarkerOperation.fromJSON( serialized, doc );

			expect( deserialized ).to.deep.equal( op );
		} );
	} );
} );
