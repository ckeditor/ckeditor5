/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Document from '../../../src/model/document';
import Range from '../../../src/model/range';
import Text from '../../../src/model/text';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import MarkerDelta from '../../../src/model/delta/markerdelta';
import MarkerOperation from '../../../src/model/operation/markeroperation';

describe( 'Batch', () => {
	let doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		root.appendChildren( new Text( 'foo' ) );
		range = Range.createIn( root );
	} );

	describe( 'setMarker', () => {
		it( 'should add marker to the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range ) ).to.be.true;
		} );

		it( 'should update marker in the document marker collection', () => {
			doc.batch().setMarker( 'name', range );

			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );
			doc.batch().setMarker( 'name', range2 );

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );
			const range2 = Range.createFromParentsAndOffsets( root, 0, root, 0 );

			const batch = doc.batch().setMarker( marker, range2 );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.markers.get( 'name' ).getRange().isEqual( range2 ) ).to.be.true;
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange.isEqual( range2 ) ).to.be.true;
		} );

		it( 'should accept empty range parameter if marker instance is passed', () => {
			const marker = doc.markers.set( 'name', range );

			sinon.spy( doc, 'fire' );

			doc.on( 'change', ( evt, type, changes ) => {
				if ( type == 'marker' ) {
					expect( changes.type ).to.equal( 'set' );
					expect( changes.name ).to.equal( 'name' );
				}
			} );

			const batch = doc.batch().setMarker( marker );
			const op = batch.deltas[ 0 ].operations[ 0 ];

			expect( doc.fire.calledWith( 'change', 'marker' ) ).to.be.true;
			expect( op.oldRange ).to.be.null;
			expect( op.newRange.isEqual( range ) ).to.be.true;
		} );

		it( 'should throw if marker with given name does not exist and range is not passed', () => {
			expect( () => {
				doc.batch().setMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-setMarker-no-range/ );
		} );
	} );

	describe( 'removeMarker', () => {
		it( 'should remove marker from the document marker collection', () => {
			doc.batch().setMarker( 'name', range );
			doc.batch().removeMarker( 'name' );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should throw when trying to remove non existing marker', () => {
			expect( () => {
				doc.batch().removeMarker( 'name' );
			} ).to.throw( CKEditorError, /^batch-removeMarker-no-marker/ );
		} );

		it( 'should accept marker instance', () => {
			doc.batch().setMarker( 'name', range );
			const marker = doc.markers.get( 'name' );

			doc.batch().removeMarker( marker );

			expect( doc.markers.get( 'name' ) ).to.be.null;
		} );
	} );

	it( 'should be chainable', () => {
		const batch = doc.batch();
		const chain = batch.setMarker( 'name', range );

		expect( chain ).to.equal( batch );
	} );

	it( 'should add delta to batch and operation to delta before applying operation', () => {
		sinon.spy( doc, 'applyOperation' );
		const batch = doc.batch().setMarker( 'name', range );

		const correctDeltaMatcher = sinon.match( operation => {
			return operation.delta && operation.delta.batch && operation.delta.batch == batch;
		} );

		expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
	} );
} );

describe( 'MarkerDelta', () => {
	let markerDelta, doc, root, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
		range = Range.createIn( root );
		markerDelta = new MarkerDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create merge delta with no operations added', () => {
			expect( markerDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to marker', () => {
			expect( markerDelta.type ).to.equal( 'marker' );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return correct MarkerDelta', () => {
			markerDelta.addOperation( new MarkerOperation( 'name', null, range, 0 ) );
			const reversed = markerDelta.getReversed();

			expect( reversed ).to.be.instanceof( MarkerDelta );
			expect( reversed.operations.length ).to.equal( 1 );

			const op = reversed.operations[ 0 ];

			expect( op ).to.be.an.instanceof( MarkerOperation );
			expect( op.oldRange.isEqual( range ) ).to.be.true;
			expect( op.newRange ).to.be.null;
		} );
	} );

	it( 'should provide proper className', () => {
		expect( MarkerDelta.className ).to.equal( 'engine.model.delta.MarkerDelta' );
	} );
} );
