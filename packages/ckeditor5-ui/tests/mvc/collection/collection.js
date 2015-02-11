/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, bender, sinon */

'use strict';

var modules = bender.amd.require( 'mvc/collection', 'mvc/model' );

describe( 'add', function() {
	it( 'should change length and enable get', function() {
		var Model = modules[ 'mvc/model' ];

		var box = getCollection();

		expect( box.length ).to.equals( 0 );

		box.add( getItem() );

		expect( box.length ).to.equals( 1 );

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
	it( 'should throw error on invalid index', function() {
		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.get( 1 );
		} ).to.throw( 'Index not found' );
	} );
} );

describe( 'remove', function() {
	it( 'should remove the model by index', function() {
		var box = getCollection();
		var item = getItem();

		box.add( item );

		expect( box.length ).to.equals( 1 );

		box.remove( 0 );

		expect( box.length ).to.equals( 0 );
	} );

	it( 'should remove the model by model', function() {
		var box = getCollection();
		var item = getItem();

		box.add( item );

		expect( box.length ).to.equals( 1 );

		box.remove( item );

		expect( box.length ).to.equals( 0 );
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

	it( 'should throw error on invalid index', function() {
		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.remove( 1 );
		} ).to.throw( 'Index not found' );
	} );

	it( 'should throw error on invalid model', function() {
		var box = getCollection();
		box.add( getItem() );

		expect( function() {
			box.remove( getItem() );
		} ).to.throw( 'Model not found' );
	} );
} );

describe( 'on', function() {
	it( 'should listen to child events', function() {
		var box = getCollection();
		var item1 = getItem();
		var item2 = getItem();
		var spy = sinon.spy();

		box.add( item1 );
		box.add( item2 );

		box.on( 'item-event', spy );

		item1.fire( 'item-event' );
		item2.fire( 'item-event' );

		sinon.assert.calledTwice( spy );
		sinon.assert.alwaysCalledOn( spy, box );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', item1 ) );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', item2 ) );
	} );
} );

function getCollection() {
	var Collection = modules[ 'mvc/collection' ];

	return new Collection();
}

function getItem() {
	var Model = modules[ 'mvc/model' ];

	return new Model();
}
