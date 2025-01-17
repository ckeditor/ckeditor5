/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MarkerCollection from '../../src/model/markercollection.js';
import Position from '../../src/model/position.js';
import Range from '../../src/model/range.js';
import LiveRange from '../../src/model/liverange.js';
import Text from '../../src/model/text.js';
import Model from '../../src/model/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MarkerCollection', () => {
	let markers, range, range2, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		markers = new MarkerCollection();

		root = doc.createRoot();
		range = new Range( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );
		range2 = new Range( Position._createAt( root, 0 ), Position._createAt( root, 2 ) );
	} );

	describe( 'iterator', () => {
		it( 'should return markers added to the marker collection', () => {
			markers._set( 'a', range );
			markers._set( 'b', range );

			const markerA = markers.get( 'a' );
			const markerB = markers.get( 'b' );

			const markersArray = Array.from( markers );

			expect( markersArray.includes( markerA ) ).to.be.true;
			expect( markersArray.includes( markerB ) ).to.be.true;
			expect( markersArray.length ).to.equal( 2 );
		} );
	} );

	describe( '_set', () => {
		it( 'should create a marker and fire update:<markerName>', () => {
			sinon.spy( markers, 'fire' );

			const result = markers._set( 'name', range );
			const marker = markers.get( 'name' );

			expect( result ).to.equal( marker );
			expect( marker.name ).to.equal( 'name' );
			expect( marker.managedUsingOperations ).to.be.false;
			expect( marker.affectsData ).to.be.false;
			expect( marker.getRange().isEqual( range ) ).to.be.true;

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				null,
				range,
				{ affectsData: false, managedUsingOperations: false, range: null }
			] );
		} );

		it( 'should create a marker marked as managed by operations', () => {
			const marker = markers._set( 'name', range, true );

			expect( marker.managedUsingOperations ).to.be.true;
		} );

		it( 'should create a marker marked as affecting the data', () => {
			const marker = markers._set( 'name', range, false, true );

			expect( marker.affectsData ).to.be.true;
		} );

		it( 'should update marker range and fire update:<markerName> event if marker with given name was in the collection', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );
			sinon.spy( marker, '_detachLiveRange' );
			sinon.spy( marker, '_attachLiveRange' );

			const result = markers._set( 'name', range2 );

			expect( result ).to.equal( marker );
			expect( marker.getRange().isEqual( range2 ) ).to.be.true;

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				range,
				range2,
				{ affectsData: false, managedUsingOperations: false, range }
			] );

			sinon.assert.calledOnce( marker._detachLiveRange );
			sinon.assert.calledOnce( marker._detachLiveRange );
		} );

		it( 'should update marker#managedUsingOperations and fire update:<markerName> event if marker with given name ' +
			'was in the collection',
		() => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );
			sinon.spy( marker, '_detachLiveRange' );
			sinon.spy( marker, '_attachLiveRange' );

			const result = markers._set( 'name', range, true );

			expect( result ).to.equal( marker );
			expect( marker.managedUsingOperations ).to.be.true;
			expect( marker.getRange().isEqual( range ) ).to.be.true;

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				range,
				range,
				{ affectsData: false, managedUsingOperations: false, range }
			] );

			sinon.assert.notCalled( marker._detachLiveRange );
			sinon.assert.notCalled( marker._attachLiveRange );
		} );

		it( 'should not fire event if given marker has not changed', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers._set( 'name', range );

			expect( marker ).to.equal( result );
			sinon.assert.notCalled( markers.fire );
		} );

		it( 'should accept marker instance instead of name', () => {
			const marker = markers._set( 'name', range );

			markers._set( marker, range2 );

			expect( marker.getRange().isEqual( range2 ) ).to.be.true;
		} );

		it( 'should throw if marker name with "," is added', () => {
			expectToThrowCKEditorError( () => {
				markers._set( 'foo,bar', range );
			}, 'markercollection-incorrect-marker-name', markers );
		} );
	} );

	describe( 'has', () => {
		it( 'should return false if marker with given name is not in the collection', () => {
			expect( markers.has( 'name' ) ).to.be.false;
		} );

		it( 'should return true if marker with given name is in the collection', () => {
			markers._set( 'name', range );
			expect( markers.has( 'name' ) ).to.be.true;
		} );

		it( 'should return false if given instance of marker is not in the collection', () => {
			const differentMarkerCollection = new MarkerCollection();
			const marker = differentMarkerCollection._set( 'differentName', range );
			expect( markers.has( marker ) ).to.be.false;
		} );

		it( 'should return true if given instance of marker is in the collection', () => {
			const marker = markers._set( 'name', range );
			expect( markers.has( marker ) ).to.be.true;
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

	describe( '_remove', () => {
		it( 'should remove marker, return true and fire update:<markerName> event', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers._remove( 'name' );

			expect( result ).to.be.true;
			expect( markers.get( 'name' ) ).to.be.null;

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				range,
				null,
				{ affectsData: false, managedUsingOperations: false, range }
			] );
		} );

		it( 'should destroy marker instance', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( marker, 'stopListening' );
			sinon.spy( marker, '_detachLiveRange' );

			markers._remove( 'name' );

			expect( marker.stopListening.calledOnce ).to.be.true;
			expect( marker._detachLiveRange.calledOnce ).to.be.true;
		} );

		it( 'should return false if name has not been found in collection', () => {
			markers._set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers._remove( 'other' );

			expect( result ).to.be.false;
			expect( markers.fire.notCalled ).to.be.true;
		} );

		it( 'should accept marker instance instead of name', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );

			const result = markers._remove( marker );

			expect( result ).to.be.true;
			expect( markers.get( 'name' ) ).to.be.null;

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				range,
				null,
				{ affectsData: false, managedUsingOperations: false, range }
			] );
		} );
	} );

	describe( '_refresh()', () => {
		it( 'should fire update:<markerName> event', () => {
			const marker = markers._set( 'name', range );

			sinon.spy( markers, 'fire' );

			markers._refresh( 'name' );

			expect( markers.fire.firstCall.args ).to.deep.equal( [
				'update:name',
				marker,
				range,
				range,
				{ affectsData: false, managedUsingOperations: false, range }
			] );
		} );

		it( 'should throw if marker does not exist', () => {
			expectToThrowCKEditorError( () => {
				markers._refresh( 'name' );
			}, 'markercollection-refresh-marker-not-exists', markers );
		} );
	} );

	describe( 'getMarkersGroup', () => {
		it( 'returns all markers which names start on given prefix', () => {
			const markerFooA = markers._set( 'foo:a', range );
			const markerFooB = markers._set( 'foo:b', range );
			markers._set( 'bar:a', range );
			markers._set( 'foobar:a', range );

			expect( Array.from( markers.getMarkersGroup( 'foo' ) ) ).to.deep.equal( [ markerFooA, markerFooB ] );
			expect( Array.from( markers.getMarkersGroup( 'a' ) ) ).to.deep.equal( [] );
		} );
	} );

	describe( 'getMarkersAtPosition', () => {
		it( 'should return iterator iterating over all markers that contains given position', () => {
			markers._set( 'a', range );
			const markerB = markers._set( 'b', range2 );

			const result = Array.from( markers.getMarkersAtPosition( Position._createAt( root, 1 ) ) );

			expect( result ).to.deep.equal( [ markerB ] );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should make MarkerCollection stop listening to all events and destroy all markers', () => {
			const markerA = markers._set( 'a', range );
			const markerB = markers._set( 'b', range2 );

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
	let model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
	} );

	it( 'should provide API that returns up-to-date marker range parameters', () => {
		root._appendChild( new Text( 'foo' ) );

		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );

		expect( marker.getRange().isEqual( range ) ).to.be.true;
		expect( marker.getStart().isEqual( range.start ) ).to.be.true;
		expect( marker.getEnd().isEqual( range.end ) ).to.be.true;

		model.change( writer => {
			writer.insertText( 'abc', root );
		} );

		const updatedRange = new Range( Position._createAt( root, 4 ), Position._createAt( root, 5 ) );

		expect( marker.getRange().isEqual( updatedRange ) ).to.be.true;
		expect( marker.getStart().isEqual( updatedRange.start ) ).to.be.true;
		expect( marker.getEnd().isEqual( updatedRange.end ) ).to.be.true;
	} );

	it( 'should throw when using the API if marker was removed from markers collection', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );

		model.markers._remove( 'name' );

		expectToThrowCKEditorError( () => {
			marker.getRange();
		}, /^marker-destroyed/ );

		expectToThrowCKEditorError( () => {
			marker.getStart();
		}, /^marker-destroyed/ );

		expectToThrowCKEditorError( () => {
			marker.getEnd();
		}, /^marker-destroyed/ );

		expectToThrowCKEditorError( () => {
			marker.managedUsingOperations;
		}, /^marker-destroyed/ );

		expectToThrowCKEditorError( () => {
			marker.affectsData;
		}, /^marker-destroyed/ );
	} );

	it( 'should attach live range to marker', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );

		const eventRange = sinon.spy();
		const eventContent = sinon.spy();

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._liveRange.fire( 'change:range', null, {} );
		marker._liveRange.fire( 'change:content', null, {} );

		expect( eventRange.calledOnce ).to.be.true;
		expect( eventContent.calledOnce ).to.be.true;
	} );

	it( 'should detach live range from marker', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );
		const liveRange = marker._liveRange;

		const eventRange = sinon.spy();
		const eventContent = sinon.spy();
		sinon.spy( liveRange, 'detach' );

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._detachLiveRange();

		liveRange.fire( 'change:range', null, {} );
		liveRange.fire( 'change:content', null, {} );

		expect( eventRange.notCalled ).to.be.true;
		expect( eventContent.notCalled ).to.be.true;
		expect( liveRange.detach.calledOnce ).to.be.true;
	} );

	it( 'should reattach live range to marker', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );
		const oldLiveRange = marker._liveRange;
		const newLiveRange = new LiveRange( Position._createAt( root, 0 ), Position._createAt( root, 1 ) );

		const eventRange = sinon.spy();
		const eventContent = sinon.spy();
		sinon.spy( oldLiveRange, 'detach' );

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._attachLiveRange( newLiveRange );

		oldLiveRange.fire( 'change:range', null, {} );
		oldLiveRange.fire( 'change:content', null, {} );

		expect( eventRange.notCalled ).to.be.true;
		expect( eventContent.notCalled ).to.be.true;
		expect( oldLiveRange.detach.calledOnce ).to.be.true;

		newLiveRange.fire( 'change:range', null, {} );
		newLiveRange.fire( 'change:content', null, {} );

		expect( eventRange.calledOnce ).to.be.true;
		expect( eventContent.calledOnce ).to.be.true;
	} );

	it( 'should change managedUsingOperations flag', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range, false );

		expect( marker.managedUsingOperations ).to.be.false;

		model.markers._set( 'name', range, true );

		expect( marker.managedUsingOperations ).to.be.true;

		model.markers._set( 'name', range, false );

		expect( marker.managedUsingOperations ).to.be.false;
	} );

	it( 'should change affectsData flag', () => {
		const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range, false, false );

		expect( marker.affectsData ).to.be.false;

		model.markers._set( 'name', range, false, true );

		expect( marker.affectsData ).to.be.true;

		model.markers._set( 'name', range, false, false );

		expect( marker.affectsData ).to.be.false;
	} );

	describe( 'is()', () => {
		let marker;

		beforeEach( () => {
			const range = new Range( Position._createAt( root, 1 ), Position._createAt( root, 2 ) );
			marker = model.markers._set( 'name', range );
		} );

		it( 'should return true for "marker"', () => {
			expect( marker.is( 'marker' ) ).to.be.true;
			expect( marker.is( 'model:marker' ) ).to.be.true;
		} );

		it( 'should return false for incorrect values', () => {
			expect( marker.is( 'model' ) ).to.be.false;
			expect( marker.is( 'model:node' ) ).to.be.false;
			expect( marker.is( '$text' ) ).to.be.false;
			expect( marker.is( 'element', 'paragraph' ) ).to.be.false;
		} );
	} );
} );
