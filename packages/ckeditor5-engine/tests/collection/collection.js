/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'collection', 'ckeditorerror' );

bender.tools.createSinonSandbox();

function getCollection( items, idProperty ) {
	var Collection = modules.collection;

	return new Collection( items, idProperty );
}

function getItem( id, idProperty ) {
	return {
		[ idProperty || 'id' ]: id
	};
}

///////////////////////////////////////

describe( 'constructor', () => {
	it( 'allows to change the id property used by the collection', () => {
		var Collection = modules.collection;
		var item1 = { id: 'foo', name: 'xx' };
		var item2 = { id: 'foo', name: 'yy' };
		var box = new Collection( { idProperty: 'name' } );

		box.add( item1 );
		box.add( item2 );

		expect( box ).to.have.length( 2 );

		expect( box.get( 'xx' ) ).to.equal( item1 );
		expect( box.remove( 'yy' ) ).to.equal( item2 );
	} );
} );

describe( 'add', () => {
	it( 'should change the length', () => {
		var box = getCollection();

		expect( box ).to.have.length( 0 );

		box.add( {} );
		expect( box ).to.have.length( 1 );

		box.add( {} );
		expect( box ).to.have.length( 2 );
	} );

	it( 'should enable get( index )', () => {
		var box = getCollection();
		var item1 = {};
		var item2 = {};

		box.add( item1 );
		expect( box.get( 0 ) ).to.equal( item1 );

		box.add( item2 );
		expect( box.get( 0 ) ).to.equal( item1 );
		expect( box.get( 1 ) ).to.equal( item2 );
	} );

	it( 'should enable get( id )', () => {
		var box = getCollection();
		var item1 = getItem( 'foo' );
		var item2 = getItem( 'bar' );

		box.add( item1 );
		box.add( item2 );

		expect( box.get( 'foo' ) ).to.equal( item1 );
		expect( box.get( 'bar' ) ).to.equal( item2 );
	} );

	it( 'should enable get( id ) - custom id property', () => {
		var box = getCollection( { idProperty: 'name' } );
		var item1 = getItem( 'foo', 'name' );
		var item2 = getItem( 'bar', 'name' );

		box.add( item1 );
		box.add( item2 );

		expect( box.get( 'foo' ) ).to.equal( item1 );
		expect( box.get( 'bar' ) ).to.equal( item2 );
	} );

	it( 'should generate an id when not defined', () => {
		var box = getCollection();
		var item = {};

		box.add( item );

		expect( item.id ).to.be.a( 'string' );
		expect( box.get( item.id ) ).to.equal( item );
	} );

	it( 'should generate an id when not defined - custom id property', () => {
		var box = getCollection( { idProperty: 'name' } );
		var item = {};

		box.add( item );

		expect( item.name ).to.be.a( 'string' );
		expect( box.get( item.name ) ).to.equal( item );
	} );

	it( 'should not change an existing id of an item', () => {
		var box = getCollection();
		var item = getItem( 'foo' );

		box.add( item );

		expect( item.id ).to.equal( 'foo' );
	} );

	it( 'should throw when item with this id already exists', () => {
		var CKEditorError = modules.CKEditorError;

		var box = getCollection();
		var item1 = getItem( 'foo' );
		var item2 = getItem( 'foo' );

		box.add( item1 );

		expect( () => {
			box.add( item2 );
		} ).to.throw( CKEditorError, /^collection-add-item-already-exists/ );
	} );

	it( 'should throw when item\'s id is not a string', () => {
		var CKEditorError = modules.CKEditorError;

		var box = getCollection();
		var item = { id: 1 };

		expect( () => {
			box.add( item );
		} ).to.throw( CKEditorError, /^collection-add-invalid-id/ );
	} );

	it(
		'should not override item under an existing id in case of a collision ' +
		'between existing items and one with an automatically generated id',
		() => {
			var box = getCollection();

			box.add( getItem( '0' ) );
			box.add( getItem( '1' ) );
			box.add( getItem( '2' ) );

			var item = {};

			box.add( item );

			expect( item ).to.have.property( 'id', '3' );
		}
	);

	it( 'should fire the "add" event', () => {
		var box = getCollection();
		var spy = sinon.spy();
		var item = {};

		box.on( 'add', spy );

		box.add( item );

		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item );
	} );
} );

describe( 'get', () => {
	it( 'should return an item', () => {
		var box = getCollection();
		var item = getItem( 'foo' );
		box.add( item );

		expect( box.get( 'foo' ) ).to.equal( item );
	} );

	it( 'should return null if id does not exist', () => {
		var box = getCollection();
		box.add( getItem( 'foo' ) );

		expect( box.get( 'bar' ) ).to.be.null;
	} );

	it( 'should throw if neither string or number given', () => {
		var CKEditorError = modules.ckeditorerror;
		var box = getCollection();

		expect( () => {
			box.get( true );
		} ).to.throw( CKEditorError, /^collection-get-invalid-arg/ );
	} );
} );

describe( 'remove', () => {
	it( 'should remove the model by index', () => {
		var box = getCollection();

		box.add( getItem( 'bom' ) );
		box.add( getItem( 'foo' ) );
		box.add( getItem( 'bar' ) );

		expect( box ).to.have.length( 3 );

		var removedItem = box.remove( 1 );

		expect( box ).to.have.length( 2 );
		expect( box.get( 'foo' ) ).to.be.null;
		expect( box.get( 1 ) ).to.have.property( 'id', 'bar' );
		expect( removedItem ).to.have.property( 'id', 'foo' );
	} );

	it( 'should remove the model by index - custom id property', () => {
		var box = getCollection( { idProperty: 'name' } );

		box.add( getItem( 'foo', 'name' ) );

		var removedItem = box.remove( 0 );

		expect( box ).to.have.length( 0 );
		expect( box.get( 'foo' ) ).to.be.null;
		expect( removedItem ).to.have.property( 'name', 'foo' );
	} );

	it( 'should remove the model by id', () => {
		var box = getCollection();

		box.add( getItem( 'bom' ) );
		box.add( getItem( 'foo' ) );
		box.add( getItem( 'bar' ) );

		expect( box ).to.have.length( 3 );

		var removedItem = box.remove( 'foo' );

		expect( box ).to.have.length( 2 );
		expect( box.get( 'foo' ) ).to.be.null;
		expect( box.get( 1 ) ).to.have.property( 'id', 'bar' );
		expect( removedItem ).to.have.property( 'id', 'foo' );
	} );

	it( 'should remove the model by model', () => {
		var box = getCollection();
		var item = getItem( 'foo' );

		box.add( getItem( 'bom' ) );
		box.add( item );
		box.add( getItem( 'bar' ) );

		expect( box ).to.have.length( 3 );

		var removedItem = box.remove( item );

		expect( box ).to.have.length( 2 );
		expect( box.get( 'foo' ) ).to.be.null;
		expect( box.get( 1 ) ).to.have.property( 'id', 'bar' );
		expect( removedItem ).to.equal( item );
	} );

	it( 'should remove the model by model - custom id property', () => {
		var box = getCollection( null, 'name' );
		var item = getItem( 'foo', 'name' );

		box.add( item );

		var removedItem = box.remove( item );

		expect( box ).to.have.length( 0 );
		expect( box.get( 'foo' ) ).to.be.null;
		expect( removedItem ).to.have.property( 'name', 'foo' );
	} );

	it( 'should fire the "remove" event', () => {
		var box = getCollection();
		var item1 = getItem( 'foo' );
		var item2 = getItem( 'bar' );
		var item3 = getItem( 'bom' );

		box.add( item1 );
		box.add( item2 );
		box.add( item3 );

		var spy = sinon.spy();

		box.on( 'remove', spy );

		box.remove( 1 );		// by index
		box.remove( item1 );	// by model
		box.remove( 'bom' );	// by id

		sinon.assert.calledThrice( spy );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item1 );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item2 );
		sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', box ), item3 );
	} );

	it( 'should throw an error on invalid index', () => {
		var CKEditorError = modules.ckeditorerror;

		var box = getCollection();
		box.add( getItem( 'foo' ) );

		expect( () => {
			box.remove( 1 );
		} ).to.throw( CKEditorError, /^collection-remove-404/ );

		expect( box ).to.have.length( 1 );
	} );

	it( 'should throw an error on invalid id', () => {
		var CKEditorError = modules.ckeditorerror;

		var box = getCollection();
		box.add( getItem( 'foo' ) );

		expect( () => {
			box.remove( 'bar' );
		} ).to.throw( CKEditorError, /^collection-remove-404/ );

		expect( box ).to.have.length( 1 );
	} );

	it( 'should throw an error on invalid model', () => {
		var CKEditorError = modules.ckeditorerror;

		var box = getCollection();
		box.add( getItem( 'foo' ) );

		expect( () => {
			box.remove( getItem( 'bar' ) );
		} ).to.throw( CKEditorError, /^collection-remove-404/ );

		expect( box ).to.have.length( 1 );
	} );
} );

describe( 'map', () => {
	it( 'uses native map', () => {
		var collection = getCollection();

		var spy = bender.sinon.stub( Array.prototype, 'map', () => {
			return [ 'foo' ];
		} );
		var ctx = {};

		var ret = collection.map( callback, ctx );

		sinon.assert.calledWithExactly( spy, callback, ctx );
		expect( ret ).to.deep.equal( [ 'foo' ], 'ret value was forwarded' );

		function callback() {}
	} );
} );

describe( 'find', () => {
	it( 'uses native find', () => {
		var collection = getCollection();
		var needl = getItem( 'foo' );

		var spy = bender.sinon.stub( Array.prototype, 'find', () => {
			return needl;
		} );
		var ctx = {};

		var ret = collection.find( callback, ctx );

		sinon.assert.calledWithExactly( spy, callback, ctx );
		expect( ret ).to.equal( needl, 'ret value was forwarded' );

		function callback() {}
	} );
} );

describe( 'filter', () => {
	it( 'uses native filter', () => {
		var collection = getCollection();
		var needl = getItem( 'foo' );

		var spy = bender.sinon.stub( Array.prototype, 'filter', () => {
			return [ needl ];
		} );
		var ctx = {};

		var ret = collection.filter( callback, ctx );

		sinon.assert.calledWithExactly( spy, callback, ctx );
		expect( ret ).to.deep.equal( [ needl ], 'ret value was forwarded' );

		function callback() {}
	} );
} );

describe( 'iterator', () => {
	it( 'covers the whole collection', () => {
		var collection = getCollection();
		var item1 = getItem( 'foo' );
		var item2 = getItem( 'bar' );
		var item3 = getItem( 'bom' );
		var items = [];

		collection.add( item1 );
		collection.add( item2 );
		collection.add( item3 );

		for ( let item of collection ) {
			items.push( item.id );
		}

		expect( items ).to.deep.equal( [ 'foo', 'bar', 'bom' ] );
	} );
} );