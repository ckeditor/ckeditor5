/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkerCollection from '../../src/model/markercollection';
import Position from '../../src/model/position';
import Range from '../../src/model/range';
import Text from '../../src/model/text';
import Document from '../../src/model/document';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'MarkerCollection', () => {
	let markers, range, range2, doc, root;

	beforeEach( () => {
		doc = new Document();
		markers = new MarkerCollection();

		root = doc.createRoot();
		range = Range.createFromParentsAndOffsets( root, 0, root, 1 );
		range2 = Range.createFromParentsAndOffsets( root, 0, root, 2 );
	} );

	describe( 'iterator', () => {
		it( 'should return markers added to the marker collection', () => {
			markers.set( 'a', range );
			markers.set( 'b', range );

			const markerA = markers.get( 'a' );
			const markerB = markers.get( 'b' );

			const markersArray = Array.from( markers );

			expect( markersArray.includes( markerA ) ).to.be.true;
			expect( markersArray.includes( markerB ) ).to.be.true;
			expect( markersArray.length ).to.equal( 2 );
		} );
	} );

	describe( 'set', () => {
		it( 'should create a marker, fire add:<markerName> event and return true', () => {
			sinon.spy( markers, 'fire' );

			const result = markers.set( 'name', range );
			const marker = markers.get( 'name' );

			expect( result ).to.equal( marker );
			expect( marker.name ).to.equal( 'name' );
			expect( marker.getRange().isEqual( range ) ).to.be.true;
			expect( markers.fire.calledWithExactly( 'add:name', marker ) ).to.be.true;
		} );

		it( 'should fire remove:<markerName> event, and create a new marker if marker with given name was in the collection', () => {
			const marker1 = markers.set( 'name', range );

			sinon.spy( markers, 'fire' );

			const marker2 = markers.set( 'name', range2 );

			expect( markers.fire.calledWithExactly( 'remove:name', marker1 ) ).to.be.true;
			expect( markers.fire.calledWithExactly( 'add:name', marker2 ) ).to.be.true;

			expect( marker2.name ).to.equal( 'name' );
			expect( marker2.getRange().isEqual( range2 ) ).to.be.true;

			expect( marker1 ).not.to.equal( marker2 );
		} );

		it( 'should not fire event and return the same marker if given marker has a range equal to given range', () => {
			const marker1 = markers.set( 'name', range );

			sinon.spy( markers, 'fire' );

			const marker2 = markers.set( 'name', range );

			expect( marker1 ).to.equal( marker2 );
			expect( markers.fire.notCalled ).to.be.true;
		} );

		it( 'should accept marker instance instead of name', () => {
			markers.set( 'name', range );
			const marker1 = markers.get( 'name' );

			const result = markers.set( marker1, range2 );
			const marker2 = markers.get( 'name' );

			expect( result ).to.equal( marker2 );
			expect( marker2.getRange().isEqual( range2 ) );
			expect( marker1 ).not.to.equal( marker2 );
		} );
	} );

	describe( 'has', () => {
		it( 'should return false if marker with given name is not in the collection', () => {
			expect( markers.has( 'name' ) ).to.be.false;
		} );

		it( 'should return true if marker with given name is in the collection', () => {
			markers.set( 'name', range );
			expect( markers.has( 'name' ) ).to.be.true;
		} );
	} );

	describe( 'get', () => {
		it( 'should return null if marker with given name has not been found', () => {
			expect( markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should always return same instance of marker', () => {
			expect( markers.get( 'name' ) ).to.equal( markers.get( 'name' ) );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove marker, return true and fire remove:<markerName> event', () => {
			const marker = markers.set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers.remove( 'name' );

			expect( result ).to.be.true;
			expect( markers.fire.calledWithExactly( 'remove:name', marker ) ).to.be.true;
			expect( markers.get( 'name' ) ).to.be.null;
		} );

		it( 'should destroy marker instance', () => {
			const marker = markers.set( 'name', range );
			const liveRange = marker._liveRange;

			sinon.spy( marker, 'stopListening' );
			sinon.spy( liveRange, 'detach' );

			markers.remove( 'name' );

			expect( marker.stopListening.calledOnce ).to.be.true;
			expect( marker._liveRange ).to.be.null;
			expect( liveRange.detach.calledOnce ).to.be.true;
		} );

		it( 'should return false if name has not been found in collection', () => {
			markers.set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers.remove( 'other' );

			expect( result ).to.be.false;
			expect( markers.fire.notCalled ).to.be.true;
		} );

		it( 'should accept marker instance instead of name', () => {
			const marker = markers.set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers.remove( marker );

			expect( result ).to.be.true;
			expect( markers.fire.calledWithExactly( 'remove:name', marker ) ).to.be.true;
			expect( markers.get( 'name' ) ).to.be.null;
		} );
	} );

	describe( 'getMarkersGroup', () => {
		it( 'returns all markers which names start on given prefix', () => {
			const markerFooA = markers.set( 'foo:a', range );
			const markerFooB = markers.set( 'foo:b', range );
			markers.set( 'bar:a', range );
			markers.set( 'foobar:a', range );

			expect( Array.from( markers.getMarkersGroup( 'foo' ) ) ).to.deep.equal( [ markerFooA, markerFooB ] );
			expect( Array.from( markers.getMarkersGroup( 'a' ) ) ).to.deep.equal( [] );
		} );
	} );

	describe( 'getMarkersAtPosition', () => {
		it( 'should return iterator iterating over all markers that contains given position', () => {
			markers.set( 'a', range );
			const markerB = markers.set( 'b', range2 );

			const result = Array.from( markers.getMarkersAtPosition( Position.createAt( root, 1 ) ) );

			expect( result ).to.deep.equal( [ markerB ] );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should make MarkerCollection stop listening to all events and destroy all markers', () => {
			const markerA = markers.set( 'a', range );
			const markerB = markers.set( 'b', range2 );

			sinon.spy( markers, 'stopListening' );
			sinon.spy( markerA, 'stopListening' );
			sinon.spy( markerB, 'stopListening' );

			markers.destroy();

			expect( markers.stopListening.calledWithExactly() ).to.be.true;
			expect( markerA.stopListening.calledWithExactly() ).to.be.true;
			expect( markerB.stopListening.calledWithExactly() ).to.be.true;
			expect( markerA._liveRange ).to.be.null;
			expect( markerB._liveRange ).to.be.null;
		} );
	} );
} );

describe( 'Marker', () => {
	let doc, root;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();
	} );

	it( 'should provide API that returns up-to-date marker range parameters', () => {
		root.appendChildren( new Text( 'foo' ) );

		const range = Range.createFromParentsAndOffsets( root, 1, root, 2 );
		const marker = doc.markers.set( 'name', range );

		expect( marker.getRange().isEqual( range ) ).to.be.true;
		expect( marker.getStart().isEqual( range.start ) ).to.be.true;
		expect( marker.getEnd().isEqual( range.end ) ).to.be.true;

		doc.enqueueChanges( () => {
			doc.batch().insert( Position.createAt( root, 0 ), 'abc' );
		} );

		const updatedRange = Range.createFromParentsAndOffsets( root, 4, root, 5 );

		expect( marker.getRange().isEqual( updatedRange ) ).to.be.true;
		expect( marker.getStart().isEqual( updatedRange.start ) ).to.be.true;
		expect( marker.getEnd().isEqual( updatedRange.end ) ).to.be.true;
	} );

	it( 'should throw when using the API if marker was removed from markers collection', () => {
		const range = Range.createFromParentsAndOffsets( root, 1, root, 2 );
		const marker = doc.markers.set( 'name', range );

		doc.markers.remove( 'name' );

		expect( () => {
			marker.getRange();
		} ).to.throw( CKEditorError, /^marker-destroyed/ );

		expect( () => {
			marker.getStart();
		} ).to.throw( CKEditorError, /^marker-destroyed/ );

		expect( () => {
			marker.getEnd();
		} ).to.throw( CKEditorError, /^marker-destroyed/ );
	} );

	it( 'should delegate events from live range', () => {
		const range = Range.createFromParentsAndOffsets( root, 1, root, 2 );
		const marker = doc.markers.set( 'name', range );

		const eventRange = sinon.spy();
		const eventContent = sinon.spy();

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._liveRange.fire( 'change:range', null, {} );
		marker._liveRange.fire( 'change:content', null, {} );

		expect( eventRange.calledOnce ).to.be.true;
		expect( eventContent.calledOnce ).to.be.true;
	} );
} );
