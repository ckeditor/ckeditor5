/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'namedcollection', 'model', 'ckeditorerror' );

describe( 'add', function() {
	it( 'changes the length and enables get', function() {
		var box = getCollection();

		expect( box ).to.have.length( 0 );

		var item = getItem( 'foo' );
		box.add( item );

		expect( box ).to.have.length( 1 );

		expect( box.get( 'foo' ) ).to.equal( item );
	} );

	it( 'fires the "add" event', function() {
		var spy = sinon.spy();

		var box = getCollection();
		box.on( 'add', spy );

		var item = getItem( 'foo' );
		box.add( item );

		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item );
	} );

	it( 'throws an error if model is not named', function() {
		var Model = modules.model;
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( box ).to.have.length( 0 );

		var item = new Model();

		expect( function() {
			box.add( item );
		} ).to.throw( CKEditorError, /^namedcollection-add/ );
	} );

	it( 'throws an error if some model already exists under the same name', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( box ).to.have.length( 0 );

		box.add( getItem( 'foo' ) );

		expect( function() {
			box.add( getItem( 'foo' ) );
		} ).to.throw( CKEditorError, /^namedcollection-add/ );
	} );
} );

describe( 'get', function() {
	it( 'should throw an error on invalid name', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		box.add( getItem( 'foo' ) );

		expect( function() {
			box.get( 'bar' );
		} ).to.throw( CKEditorError, /^namedcollection-get/ );
	} );
} );

describe( 'remove', function() {
	it( 'should remove the model by name', function() {
		var box = getCollection();
		var item = getItem( 'foo' );

		box.add( item );

		expect( box ).to.have.length( 1 );

		box.remove( 'foo' );

		expect( box ).to.have.length( 0 );
	} );

	it( 'should remove the model by model', function() {
		var box = getCollection();
		var item = getItem( 'foo' );

		box.add( item );

		expect( box ).to.have.length( 1 );

		box.remove( item );

		expect( box ).to.have.length( 0 );
	} );

	it( 'should fire the "remove" event', function() {
		var box = getCollection();
		var item1 = getItem( 'foo' );
		var item2 = getItem( 'bar' );

		box.add( item1 );
		box.add( item2 );

		var spy = sinon.spy();

		box.on( 'remove', spy );

		box.remove( 'foo' ); // by name
		box.remove( item2 ); // by model

		sinon.assert.calledTwice( spy );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item1 );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item2 );
	} );

	it( 'should throw an error if model is not named', function() {
		var CKEditorError = modules.ckeditorerror;
		var Model = modules.model;
		var box = getCollection();

		expect( function() {
			box.remove( new Model() );
		} ).to.throw( CKEditorError, /^namedcollection-remove/ );
	} );

	it( 'should throw an error if model does not exist (by name)', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( function() {
			box.remove( 'foo' );
		} ).to.throw( CKEditorError, /^namedcollection-remove/ );
	} );

	it( 'should throw an error if model does not exist (by model)', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( function() {
			box.remove( getItem( 'foo' ) );
		} ).to.throw( CKEditorError, /^namedcollection-remove/ );
	} );

	it( 'should throw an error if model does not exist (by model)', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( function() {
			box.remove( getItem( 'foo' ) );
		} ).to.throw( CKEditorError, /^namedcollection-remove/ );
	} );

	it( 'should throw an error if a different model exists under the same name', function() {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();
		var item = getItem( 'foo' );

		box.add( item );

		expect( function() {
			box.remove( getItem( 'foo' ) );
		} ).to.throw( CKEditorError, /^namedcollection-remove/ );
	} );
} );

function getCollection() {
	var NamedCollection = modules.namedcollection;

	return new NamedCollection();
}

function getItem( name ) {
	var Model = modules.model;

	var model = new Model();
	model.name = name;

	return model;
}
