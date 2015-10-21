/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'collection', 'model' );

describe( 'add', function() {
	it( 'should change the length and enable get', function() {
		var Model = modules.model;

		var box = getCollection();

		expect( box ).to.have.length( 0 );

		box.add( getItem() );

		expect( box ).to.have.length( 1 );

		expect( box.get( 0 ) ).to.be.an.instanceof( Model );
	} );

	it( 'should fire the "add" event', function() {
		var spy = sinon.spy();

		var box = getCollection();
		box.on( 'add', spy );

		var item = getItem();
		box.add( item );

		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item );
	} );
} );

describe( 'get', function() {
	it( 'should throw an error on invalid index', function() {
		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.get( 1 );
		} ).to.throw( Error, 'Index not found' );
	} );
} );

describe( 'remove', function() {
	it( 'should remove the model by index', function() {
		var box = getCollection();
		var item = getItem();

		box.add( item );

		expect( box ).to.have.length( 1 );

		box.remove( 0 );

		expect( box ).to.have.length( 0 );
	} );

	it( 'should remove the model by model', function() {
		var box = getCollection();
		var item = getItem();

		box.add( item );

		expect( box ).to.have.length( 1 );

		box.remove( item );

		expect( box ).to.have.length( 0 );
	} );

	it( 'should fire the "remove" event', function() {
		var box = getCollection();
		var item1 = getItem();
		var item2 = getItem();

		box.add( item1 );
		box.add( item2 );

		var spy = sinon.spy();

		box.on( 'remove', spy );

		box.remove( 1 );		// by index
		box.remove( item1 );	// by model

		sinon.assert.calledTwice( spy );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item1 );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item2 );
	} );

	it( 'should throw an error on invalid index', function() {
		var CKEditorError = modules.ckeditorerror;

		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.remove( 1 );
		} ).to.throw( CKEditorError, /^collection-index-404/ );
	} );

	it( 'should throw an error on invalid model', function() {
		var CKEditorError = modules.ckeditorerror;

		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.remove( getItem() );
		} ).to.throw( CKEditorError, /^collection-model-404/ );
	} );
} );

function getCollection() {
	var Collection = modules.collection;

	return new Collection();
}

function getItem() {
	var Model = modules.model;

	return new Model();
}
