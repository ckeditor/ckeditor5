/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'collection', 'ckeditorerror' );

bender.tools.createSinonSandbox();

function getItem( id, idProperty ) {
	return {
		[ idProperty || 'id' ]: id
	};
}

describe( 'Collection', () => {
	let Collection, CKEditorError;

	before( () => {
		Collection = modules.collection;
		CKEditorError = modules.CKEditorError;
	} );

	var collection;

	beforeEach( () => {
		collection = new Collection();
	} );

	describe( 'constructor', () => {
		it( 'allows to change the id property used by the collection', () => {
			var item1 = { id: 'foo', name: 'xx' };
			var item2 = { id: 'foo', name: 'yy' };
			var collection = new Collection( { idProperty: 'name' } );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection ).to.have.length( 2 );

			expect( collection.get( 'xx' ) ).to.equal( item1 );
			expect( collection.remove( 'yy' ) ).to.equal( item2 );
		} );
	} );

	describe( 'add', () => {
		it( 'should be chainable', () => {
			expect( collection.add( {} ) ).to.equal( collection );
		} );

		it( 'should change the length', () => {
			expect( collection ).to.have.length( 0 );

			collection.add( {} );
			expect( collection ).to.have.length( 1 );

			collection.add( {} );
			expect( collection ).to.have.length( 2 );
		} );

		it( 'should enable get( index )', () => {
			var item1 = {};
			var item2 = {};

			collection.add( item1 );
			expect( collection.get( 0 ) ).to.equal( item1 );

			collection.add( item2 );
			expect( collection.get( 0 ) ).to.equal( item1 );
			expect( collection.get( 1 ) ).to.equal( item2 );
		} );

		it( 'should enable get( id )', () => {
			var item1 = getItem( 'foo' );
			var item2 = getItem( 'bar' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should enable get( id ) - custom id property', () => {
			var collection = new Collection( { idProperty: 'name' } );
			var item1 = getItem( 'foo', 'name' );
			var item2 = getItem( 'bar', 'name' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should generate an id when not defined', () => {
			var item = {};

			collection.add( item );

			expect( item.id ).to.be.a( 'string' );
			expect( collection.get( item.id ) ).to.equal( item );
		} );

		it( 'should generate an id when not defined - custom id property', () => {
			var collection = new Collection( { idProperty: 'name' } );
			var item = {};

			collection.add( item );

			expect( item.name ).to.be.a( 'string' );
			expect( collection.get( item.name ) ).to.equal( item );
		} );

		it( 'should not change an existing id of an item', () => {
			var item = getItem( 'foo' );

			collection.add( item );

			expect( item.id ).to.equal( 'foo' );
		} );

		it( 'should throw when item with this id already exists', () => {
			var item1 = getItem( 'foo' );
			var item2 = getItem( 'foo' );

			collection.add( item1 );

			expect( () => {
				collection.add( item2 );
			} ).to.throw( CKEditorError, /^collection-add-item-already-exists/ );
		} );

		it( 'should throw when item\'s id is not a string', () => {
			var item = { id: 1 };

			expect( () => {
				collection.add( item );
			} ).to.throw( CKEditorError, /^collection-add-invalid-id/ );
		} );

		it(
			'should not override item under an existing id in case of a collision ' +
			'between existing items and one with an automatically generated id',
			() => {
				collection.add( getItem( '0' ) );
				collection.add( getItem( '1' ) );
				collection.add( getItem( '2' ) );

				var item = {};

				collection.add( item );

				expect( item ).to.have.property( 'id', '3' );
			}
		);

		it( 'should fire the "add" event', () => {
			var spy = sinon.spy();
			var item = {};

			collection.on( 'add', spy );

			collection.add( item );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item );
		} );
	} );

	describe( 'get', () => {
		it( 'should return an item', () => {
			var item = getItem( 'foo' );
			collection.add( item );

			expect( collection.get( 'foo' ) ).to.equal( item );
		} );

		it( 'should return null if id does not exist', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.get( 'bar' ) ).to.be.null;
		} );

		it( 'should throw if neither string or number given', () => {
			expect( () => {
				collection.get( true );
			} ).to.throw( CKEditorError, /^collection-get-invalid-arg/ );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove the model by index', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			var removedItem = collection.remove( 1 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by index - custom id property', () => {
			var collection = new Collection( { idProperty: 'name' } );

			collection.add( getItem( 'foo', 'name' ) );

			var removedItem = collection.remove( 0 );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should remove the model by id', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			var removedItem = collection.remove( 'foo' );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by model', () => {
			var item = getItem( 'foo' );

			collection.add( getItem( 'bom' ) );
			collection.add( item );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			var removedItem = collection.remove( item );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.equal( item );
		} );

		it( 'should remove the model by model - custom id property', () => {
			var collection = new Collection( null, 'name' );
			var item = getItem( 'foo', 'name' );

			collection.add( item );

			var removedItem = collection.remove( item );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should fire the "remove" event', () => {
			var item1 = getItem( 'foo' );
			var item2 = getItem( 'bar' );
			var item3 = getItem( 'bom' );

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			var spy = sinon.spy();

			collection.on( 'remove', spy );

			collection.remove( 1 );		// by index
			collection.remove( item1 );	// by model
			collection.remove( 'bom' );	// by id

			sinon.assert.calledThrice( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item1 );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item2 );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item3 );
		} );

		it( 'should throw an error on invalid index', () => {
			collection.add( getItem( 'foo' ) );

			expect( () => {
				collection.remove( 1 );
			} ).to.throw( CKEditorError, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );

		it( 'should throw an error on invalid id', () => {
			collection.add( getItem( 'foo' ) );

			expect( () => {
				collection.remove( 'bar' );
			} ).to.throw( CKEditorError, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );

		it( 'should throw an error on invalid model', () => {
			collection.add( getItem( 'foo' ) );

			expect( () => {
				collection.remove( getItem( 'bar' ) );
			} ).to.throw( CKEditorError, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );
	} );

	describe( 'map', () => {
		it( 'uses native map', () => {
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
} );