/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import MarkersCollection from 'ckeditor5/engine/model/markerscollection.js';
import Range from 'ckeditor5/engine/model/range.js';
import LiveRange from 'ckeditor5/engine/model/liverange.js';
import Document from 'ckeditor5/engine/model/document.js';
import CKEditorError from 'ckeditor5/utils/ckeditorerror.js';

let markers, live, doc, root;

beforeEach( () => {
	doc = new Document();
	markers = new MarkersCollection();

	root = doc.createRoot();
	live = LiveRange.createFromParentsAndOffsets( root, 0, root, 4 );
} );

afterEach( () => {
	markers.destroy();
	live.detach();
} );

describe( 'MarkersCollection', () => {
	describe( 'addRange', () => {
		it( 'should throw if passed parameter is not a LiveRange', () => {
			const range = Range.createFromParentsAndOffsets( root, 1, root, 3 );

			expect( () => {
				markers.addRange( range, 'name' );
			} ).to.throw( CKEditorError, /^markers-collection-add-range-not-live-range/ );
		} );

		it( 'should fire addMarker event when range is added', () => {
			sinon.spy( markers, 'fire' );

			markers.on( 'addMarker', ( evt, name, range ) => {
				expect( name ).to.equal( 'name' );
				expect( range.isEqual( live ) ).to.be.true;
				expect( range ).not.to.equal( live );
			} );

			markers.addRange( live, 'name' );

			expect( markers.fire.calledWith( 'addMarker' ) ).to.be.true;
		} );

		it( 'should throw if given range was already added', () => {
			markers.addRange( live, 'name' );

			expect( () => {
				markers.addRange( live, 'otherName' );
			} ).to.throw( CKEditorError, /^markers-collection-add-range-already-added/ );
		} );
	} );

	describe( 'removeRange', () => {
		it( 'should return false if range has not been found in collection', () => {
			const result = markers.removeRange( live );

			expect( result ).to.be.false;
		} );

		it( 'should return true and fire removeMarker event if range is removed', () => {
			markers.addRange( live, 'name' );

			sinon.spy( markers, 'fire' );

			markers.on( 'removeMarker', ( evt, name, range ) => {
				expect( name ).to.equal( 'name' );
				expect( range.isEqual( live ) ).to.be.true;
				expect( range ).not.to.equal( live );
			} );

			const result = markers.removeRange( live );

			expect( result ).to.be.true;
			expect( markers.fire.calledWith( 'removeMarker' ) ).to.be.true;
		} );

		it( 'should make MarkersCollection stop listening to range change event', () => {
			markers.addRange( live, 'name' );
			markers.removeRange( live );

			sinon.spy( markers, 'fire' );

			// Simulate LiveRange change.
			const oldRange = Range.createFromRange( live );
			live.end.path[ 0 ]++;
			live.fire( 'change', oldRange );

			expect( markers.fire.called ).to.be.false;
		} );
	} );

	describe( 'updateRange', () => {
		let newLive;

		beforeEach( () => {
			newLive = LiveRange.createFromParentsAndOffsets( root, 1, root, 5 );
		} );

		afterEach( () => {
			newLive.detach();
		} );

		it( 'should return false if given range was not found in collection', () => {
			const result = markers.updateRange( live, newLive );

			expect( result ).to.be.false;
		} );

		it( 'should return true and use removeRange and addRange methods if range was found in collection', () => {
			const newLive = LiveRange.createFromParentsAndOffsets( root, 1, root, 5 );
			markers.addRange( live, 'name' );

			sinon.spy( markers, 'removeRange' );
			sinon.spy( markers, 'addRange' );

			const result = markers.updateRange( live, newLive );

			expect( markers.removeRange.calledWith( live ) ).to.be.true;
			expect( markers.addRange.calledWith( newLive, 'name' ) ).to.be.true;
			expect( result ).to.be.true;
		} );
	} );

	describe( 'destroy', () => {
		it( 'should make MarkersCollection stop listening to all events', () => {
			sinon.spy( markers, 'stopListening' );

			markers.destroy();

			expect( markers.stopListening.calledWithExactly() ).to.be.true;
		} );
	} );
} );
