/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

import MarkersCollection from 'ckeditor5-engine/src/model/markerscollection';
import Range from 'ckeditor5-engine/src/model/range';
import LiveRange from 'ckeditor5-engine/src/model/liverange';
import Document from 'ckeditor5-engine/src/model/document';
import CKEditorError from 'ckeditor5-utils/src/ckeditorerror';

describe( 'MarkersCollection', () => {
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

	describe( 'add', () => {
		it( 'should throw if passed parameter is not a LiveRange', () => {
			const range = Range.createFromParentsAndOffsets( root, 1, root, 3 );

			expect( () => {
				markers.add( 'name', range );
			} ).to.throw( CKEditorError, /^markers-collection-add-range-not-live-range/ );
		} );

		it( 'should fire add event when range is added', () => {
			sinon.spy( markers, 'fire' );

			markers.on( 'add', ( evt, name, range ) => {
				expect( name ).to.equal( 'name' );
				expect( range.isEqual( live ) ).to.be.true;
				expect( range ).not.to.equal( live );
			} );

			markers.add( 'name', live );

			expect( markers.fire.calledWith( 'add' ) ).to.be.true;
		} );

		it( 'should throw if given name was already added', () => {
			const other = LiveRange.createFromParentsAndOffsets( root, 0, root, 4 );
			markers.add( 'name', other );

			other.detach();

			expect( () => {
				markers.add( 'name', live );
			} ).to.throw( CKEditorError, /^markers-collection-add-name-exists/ );
		} );
	} );

	describe( 'get', () => {
		it( 'should return range added to the collection with given name', () => {
			markers.add( 'name', live );

			expect( markers.get( 'name' ) ).to.equal( live );
		} );

		it( 'should return null if range with given name has not been found', () => {
			expect( markers.get( 'name' ) ).to.be.null;
		} );
	} );

	describe( 'remove', () => {
		it( 'should return true and fire remove event if range is removed', () => {
			markers.add( 'name', live );

			sinon.spy( markers, 'fire' );

			markers.on( 'remove', ( evt, name, range ) => {
				expect( name ).to.equal( 'name' );
				expect( range.isEqual( live ) ).to.be.true;
				expect( range ).not.to.equal( live );
			} );

			const result = markers.remove( 'name' );

			expect( result ).to.be.true;
			expect( markers.fire.calledWith( 'remove' ) ).to.be.true;
		} );

		it( 'should return false if name has not been found in collection', () => {
			markers.add( 'name', live );

			const result = markers.remove( 'other' );

			expect( result ).to.be.false;
		} );
	} );

	describe( 'update', () => {
		let newLive;

		beforeEach( () => {
			newLive = LiveRange.createFromParentsAndOffsets( root, 1, root, 5 );
		} );

		afterEach( () => {
			newLive.detach();
		} );

		it( 'should return true and use remove and add methods if range was found in collection', () => {
			const newLive = LiveRange.createFromParentsAndOffsets( root, 1, root, 5 );
			markers.add( 'name', live );

			sinon.spy( markers, 'remove' );
			sinon.spy( markers, 'add' );

			const result = markers.update( 'name', newLive );

			expect( markers.remove.calledWith( 'name' ) ).to.be.true;
			expect( markers.add.calledWith( 'name', newLive ) ).to.be.true;
			expect( result ).to.be.true;

			newLive.detach();
		} );

		it( 'should return false if given name was not found in collection', () => {
			const result = markers.update( 'name', newLive );

			expect( result ).to.be.false;
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
