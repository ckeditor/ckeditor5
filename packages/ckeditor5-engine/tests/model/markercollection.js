/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkerCollection } from '../../src/model/markercollection.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelLiveRange } from '../../src/model/liverange.js';
import { ModelText } from '../../src/model/text.js';
import { Model } from '../../src/model/model.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'MarkerCollection', () => {
	let markers, range, range2, doc, root;

	beforeEach( () => {
		const model = new Model();

		doc = model.document;
		markers = new MarkerCollection();

		root = doc.createRoot();
		range = new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) );
		range2 = new ModelRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 2 ) );
	} );

	describe( 'iterator', () => {
		it( 'should return markers added to the marker collection', () => {
			markers._set( 'a', range );
			markers._set( 'b', range );

			const markerA = markers.get( 'a' );
			const markerB = markers.get( 'b' );

			const markersArray = Array.from( markers );

			expect( markersArray.includes( markerA ) ).toBe( true );
			expect( markersArray.includes( markerB ) ).toBe( true );
			expect( markersArray.length ).toBe( 2 );
		} );
	} );

	describe( '_set', () => {
		it( 'should create a marker and fire update:<markerName>', () => {
			vi.spyOn( markers, 'fire' );

			const result = markers._set( 'name', range );
			const marker = markers.get( 'name' );

			expect( result ).toBe( marker );
			expect( marker.name ).toBe( 'name' );
			expect( marker.managedUsingOperations ).toBe( false );
			expect( marker.affectsData ).toBe( false );
			expect( marker.getRange().isEqual( range ) ).toBe( true );

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
				'update:name',
				marker,
				null,
				range,
				{ affectsData: false, managedUsingOperations: false, range: null }
			] );
		} );

		it( 'should create a marker marked as managed by operations', () => {
			const marker = markers._set( 'name', range, true );

			expect( marker.managedUsingOperations ).toBe( true );
		} );

		it( 'should create a marker marked as affecting the data', () => {
			const marker = markers._set( 'name', range, false, true );

			expect( marker.affectsData ).toBe( true );
		} );

		it( 'should update marker range and fire update:<markerName> event if marker with given name was in the collection', () => {
			const marker = markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );
			vi.spyOn( marker, '_detachLiveRange' );
			vi.spyOn( marker, '_attachLiveRange' );

			const result = markers._set( 'name', range2 );

			expect( result ).toBe( marker );
			expect( marker.getRange().isEqual( range2 ) ).toBe( true );

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
				'update:name',
				marker,
				range,
				range2,
				{ affectsData: false, managedUsingOperations: false, range }
			] );

			expect( marker._detachLiveRange ).toHaveBeenCalledOnce();
			expect( marker._detachLiveRange ).toHaveBeenCalledOnce();
		} );

		it( 'should update marker#managedUsingOperations and fire update:<markerName> event if marker with given name ' +
			'was in the collection',
		() => {
			const marker = markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );
			vi.spyOn( marker, '_detachLiveRange' );
			vi.spyOn( marker, '_attachLiveRange' );

			const result = markers._set( 'name', range, true );

			expect( result ).toBe( marker );
			expect( marker.managedUsingOperations ).toBe( true );
			expect( marker.getRange().isEqual( range ) ).toBe( true );

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
				'update:name',
				marker,
				range,
				range,
				{ affectsData: false, managedUsingOperations: false, range }
			] );

			expect( marker._detachLiveRange ).not.toHaveBeenCalled();
			expect( marker._attachLiveRange ).not.toHaveBeenCalled();
		} );

		it( 'should not fire event if given marker has not changed', () => {
			const marker = markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );

			const result = markers._set( 'name', range );

			expect( marker ).toBe( result );
			expect( markers.fire ).not.toHaveBeenCalled();
		} );

		it( 'should accept marker instance instead of name', () => {
			const marker = markers._set( 'name', range );

			markers._set( marker, range2 );

			expect( marker.getRange().isEqual( range2 ) ).toBe( true );
		} );

		it( 'should throw if marker name with "," is added', () => {
			expectToThrowCKEditorError( () => {
				markers._set( 'foo,bar', range );
			}, 'markercollection-incorrect-marker-name', markers );
		} );
	} );

	describe( 'has', () => {
		it( 'should return false if marker with given name is not in the collection', () => {
			expect( markers.has( 'name' ) ).toBe( false );
		} );

		it( 'should return true if marker with given name is in the collection', () => {
			markers._set( 'name', range );
			expect( markers.has( 'name' ) ).toBe( true );
		} );

		it( 'should return false if given instance of marker is not in the collection', () => {
			const differentMarkerCollection = new MarkerCollection();
			const marker = differentMarkerCollection._set( 'differentName', range );
			expect( markers.has( marker ) ).toBe( false );
		} );

		it( 'should return true if given instance of marker is in the collection', () => {
			const marker = markers._set( 'name', range );
			expect( markers.has( marker ) ).toBe( true );
		} );
	} );

	describe( 'get', () => {
		it( 'should return null if marker with given name has not been found', () => {
			expect( markers.get( 'name' ) ).toBeNull();
		} );

		it( 'should always return same instance of marker', () => {
			expect( markers.get( 'name' ) ).toBe( markers.get( 'name' ) );
		} );
	} );

	describe( '_remove', () => {
		it( 'should remove marker, return true and fire update:<markerName> event', () => {
			const marker = markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );

			const result = markers._remove( 'name' );

			expect( result ).toBe( true );
			expect( markers.get( 'name' ) ).toBeNull();

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
				'update:name',
				marker,
				range,
				null,
				{ affectsData: false, managedUsingOperations: false, range }
			] );
		} );

		it( 'should destroy marker instance', () => {
			const marker = markers._set( 'name', range );

			vi.spyOn( marker, 'stopListening' );
			vi.spyOn( marker, '_detachLiveRange' );

			markers._remove( 'name' );

			expect( marker.stopListening ).toHaveBeenCalledOnce();
			expect( marker._detachLiveRange ).toHaveBeenCalledOnce();
		} );

		it( 'should return false if name has not been found in collection', () => {
			markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );

			const result = markers._remove( 'other' );

			expect( result ).toBe( false );
			expect( markers.fire ).not.toHaveBeenCalled();
		} );

		it( 'should accept marker instance instead of name', () => {
			const marker = markers._set( 'name', range );

			vi.spyOn( markers, 'fire' );

			const result = markers._remove( marker );

			expect( result ).toBe( true );
			expect( markers.get( 'name' ) ).toBeNull();

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
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

			vi.spyOn( markers, 'fire' );

			markers._refresh( 'name' );

			expect( markers.fire.mock.calls[ 0 ] ).toEqual( [
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

			expect( Array.from( markers.getMarkersGroup( 'foo' ) ) ).toEqual( [ markerFooA, markerFooB ] );
			expect( Array.from( markers.getMarkersGroup( 'a' ) ) ).toEqual( [] );
		} );
	} );

	describe( 'getMarkersAtPosition', () => {
		it( 'should return iterator iterating over all markers that contains given position', () => {
			markers._set( 'a', range );
			const markerB = markers._set( 'b', range2 );

			const result = Array.from( markers.getMarkersAtPosition( ModelPosition._createAt( root, 1 ) ) );

			expect( result ).toEqual( [ markerB ] );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should make MarkerCollection stop listening to all events and destroy all markers', () => {
			const markerA = markers._set( 'a', range );
			const markerB = markers._set( 'b', range2 );

			vi.spyOn( markers, 'stopListening' );
			vi.spyOn( markerA, 'stopListening' );
			vi.spyOn( markerB, 'stopListening' );

			markers.destroy();

			expect( markers.stopListening ).toHaveBeenCalledWith();
			expect( markerA.stopListening ).toHaveBeenCalledWith();
			expect( markerB.stopListening ).toHaveBeenCalledWith();
			expect( markerA._liveRange ).toBeNull();
			expect( markerB._liveRange ).toBeNull();
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
		root._appendChild( new ModelText( 'foo' ) );

		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );

		expect( marker.getRange().isEqual( range ) ).toBe( true );
		expect( marker.getStart().isEqual( range.start ) ).toBe( true );
		expect( marker.getEnd().isEqual( range.end ) ).toBe( true );

		model.change( writer => {
			writer.insertText( 'abc', root );
		} );

		const updatedRange = new ModelRange( ModelPosition._createAt( root, 4 ), ModelPosition._createAt( root, 5 ) );

		expect( marker.getRange().isEqual( updatedRange ) ).toBe( true );
		expect( marker.getStart().isEqual( updatedRange.start ) ).toBe( true );
		expect( marker.getEnd().isEqual( updatedRange.end ) ).toBe( true );
	} );

	it( 'should throw when using the API if marker was removed from markers collection', () => {
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
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
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );

		const eventRange = vi.fn();
		const eventContent = vi.fn();

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._liveRange.fire( 'change:range', null, {} );
		marker._liveRange.fire( 'change:content', null, {} );

		expect( eventRange ).toHaveBeenCalledOnce();
		expect( eventContent ).toHaveBeenCalledOnce();
	} );

	it( 'should detach live range from marker', () => {
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );
		const liveRange = marker._liveRange;

		const eventRange = vi.fn();
		const eventContent = vi.fn();
		vi.spyOn( liveRange, 'detach' );

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._detachLiveRange();

		liveRange.fire( 'change:range', null, {} );
		liveRange.fire( 'change:content', null, {} );

		expect( eventRange ).not.toHaveBeenCalled();
		expect( eventContent ).not.toHaveBeenCalled();
		expect( liveRange.detach ).toHaveBeenCalledOnce();
	} );

	it( 'should reattach live range to marker', () => {
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range );
		const oldLiveRange = marker._liveRange;
		const newLiveRange = new ModelLiveRange( ModelPosition._createAt( root, 0 ), ModelPosition._createAt( root, 1 ) );

		const eventRange = vi.fn();
		const eventContent = vi.fn();
		vi.spyOn( oldLiveRange, 'detach' );

		marker.on( 'change:range', eventRange );
		marker.on( 'change:content', eventContent );

		marker._attachLiveRange( newLiveRange );

		oldLiveRange.fire( 'change:range', null, {} );
		oldLiveRange.fire( 'change:content', null, {} );

		expect( eventRange ).not.toHaveBeenCalled();
		expect( eventContent ).not.toHaveBeenCalled();
		expect( oldLiveRange.detach ).toHaveBeenCalledOnce();

		newLiveRange.fire( 'change:range', null, {} );
		newLiveRange.fire( 'change:content', null, {} );

		expect( eventRange ).toHaveBeenCalledOnce();
		expect( eventContent ).toHaveBeenCalledOnce();
	} );

	it( 'should change managedUsingOperations flag', () => {
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range, false );

		expect( marker.managedUsingOperations ).toBe( false );

		model.markers._set( 'name', range, true );

		expect( marker.managedUsingOperations ).toBe( true );

		model.markers._set( 'name', range, false );

		expect( marker.managedUsingOperations ).toBe( false );
	} );

	it( 'should change affectsData flag', () => {
		const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
		const marker = model.markers._set( 'name', range, false, false );

		expect( marker.affectsData ).toBe( false );

		model.markers._set( 'name', range, false, true );

		expect( marker.affectsData ).toBe( true );

		model.markers._set( 'name', range, false, false );

		expect( marker.affectsData ).toBe( false );
	} );

	describe( 'is()', () => {
		let marker;

		beforeEach( () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			marker = model.markers._set( 'name', range );
		} );

		it( 'should return true for "marker"', () => {
			expect( marker.is( 'marker' ) ).toBe( true );
			expect( marker.is( 'model:marker' ) ).toBe( true );
		} );

		it( 'should return false for incorrect values', () => {
			expect( marker.is( 'model' ) ).toBe( false );
			expect( marker.is( 'model:node' ) ).toBe( false );
			expect( marker.is( '$text' ) ).toBe( false );
			expect( marker.is( 'element', 'paragraph' ) ).toBe( false );
		} );
	} );

	describe( 'toJSON()', () => {
		it( 'should return JSON (affectsData=false, usingOperations=false)', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const marker = model.markers._set( 'foo', range );

			const json = JSON.stringify( marker );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'foo',
				affectsData: false,
				usingOperations: false,
				range: {
					start: {
						path: [ 1 ],
						root: 'main',
						stickiness: 'toNext'
					},
					end: {
						path: [ 2 ],
						root: 'main',
						stickiness: 'toPrevious'
					}
				}
			} );
		} );

		it( 'should return JSON (affectsData=true, usingOperations=false)', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const marker = model.markers._set( 'foo', range, false, true );

			const json = JSON.stringify( marker );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'foo',
				affectsData: true,
				usingOperations: false,
				range: {
					start: {
						path: [ 1 ],
						root: 'main',
						stickiness: 'toNext'
					},
					end: {
						path: [ 2 ],
						root: 'main',
						stickiness: 'toPrevious'
					}
				}
			} );
		} );

		it( 'should return JSON (affectsData=true, usingOperations=true)', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const marker = model.markers._set( 'foo', range, true, true );

			const json = JSON.stringify( marker );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'foo',
				affectsData: true,
				usingOperations: true,
				range: {
					start: {
						path: [ 1 ],
						root: 'main',
						stickiness: 'toNext'
					},
					end: {
						path: [ 2 ],
						root: 'main',
						stickiness: 'toPrevious'
					}
				}
			} );
		} );

		it( 'should return JSON (affectsData=false, usingOperations=true)', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const marker = model.markers._set( 'foo', range, true, false );

			const json = JSON.stringify( marker );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'foo',
				affectsData: false,
				usingOperations: true,
				range: {
					start: {
						path: [ 1 ],
						root: 'main',
						stickiness: 'toNext'
					},
					end: {
						path: [ 2 ],
						root: 'main',
						stickiness: 'toPrevious'
					}
				}
			} );
		} );

		it( 'should return JSON for destroyed marker', () => {
			const range = new ModelRange( ModelPosition._createAt( root, 1 ), ModelPosition._createAt( root, 2 ) );
			const marker = model.markers._set( 'foo', range );

			model.markers._remove( 'foo' );

			const json = JSON.stringify( marker );
			const parsed = JSON.parse( json );

			expect( parsed ).toEqual( {
				name: 'foo',
				affectsData: false,
				usingOperations: false
			} );
		} );
	} );
} );
