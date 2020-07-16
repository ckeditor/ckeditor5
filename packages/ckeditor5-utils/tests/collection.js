/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Collection from '../src/collection';
import { expectToThrowCKEditorError } from '../tests/_utils/utils';

function getItem( id, idProperty ) {
	idProperty = idProperty || 'id';

	return {
		[ idProperty ]: id
	};
}

describe( 'Collection', () => {
	let collection;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		collection = new Collection();
	} );

	describe( 'constructor()', () => {
		describe( 'setting initial collection items', () => {
			it( 'should work using an array', () => {
				const item1 = getItem( 'foo' );
				const item2 = getItem( 'bar' );
				const collection = new Collection( [ item1, item2 ] );

				expect( collection ).to.have.length( 2 );

				expect( collection.get( 0 ) ).to.equal( item1 );
				expect( collection.get( 1 ) ).to.equal( item2 );
				expect( collection.get( 'foo' ) ).to.equal( item1 );
				expect( collection.get( 'bar' ) ).to.equal( item2 );
			} );

			it( 'should work using an iterable', () => {
				const item1 = getItem( 'foo' );
				const item2 = getItem( 'bar' );
				const itemsSet = new Set( [ item1, item2 ] );
				const collection = new Collection( itemsSet );

				expect( collection ).to.have.length( 2 );

				expect( collection.get( 0 ) ).to.equal( item1 );
				expect( collection.get( 1 ) ).to.equal( item2 );
			} );

			it( 'should generate ids for items that doesn\'t have it', () => {
				const item = {};
				const collection = new Collection( [ item ] );

				expect( collection.get( 0 ).id ).to.be.a( 'string' );
				expect( collection.get( 0 ).id ).not.to.be.empty;
			} );

			it( 'should throw an error when an invalid item key is provided', () => {
				const badIdItem = getItem( 1 ); // Number id is not supported.

				expectToThrowCKEditorError( () => {
					return new Collection( [ badIdItem ] );
				}, /^collection-add-invalid-id/ );
			} );

			it( 'should throw an error when two items have the same key', () => {
				const item1 = getItem( 'foo' );
				const item2 = getItem( 'foo' );

				expectToThrowCKEditorError( () => {
					return new Collection( [ item1, item2 ] );
				}, /^collection-add-item-already-exists/ );
			} );
		} );

		describe( 'options', () => {
			it( 'should allow to change the id property used by the collection', () => {
				const item1 = { id: 'foo', name: 'xx' };
				const item2 = { id: 'foo', name: 'yy' };
				const collection = new Collection( { idProperty: 'name' } );

				collection.add( item1 );
				collection.add( item2 );

				expect( collection ).to.have.length( 2 );

				expect( collection.get( 'xx' ) ).to.equal( item1 );
				expect( collection.remove( 'yy' ) ).to.equal( item2 );
			} );

			it( 'should allow to change the id property used by the collection (initial items passed to the constructor)', () => {
				const item1 = { id: 'foo', name: 'xx' };
				const item2 = { id: 'foo', name: 'yy' };
				const collection = new Collection( [ item1, item2 ], { idProperty: 'name' } );

				expect( collection ).to.have.length( 2 );

				expect( collection.get( 'xx' ) ).to.equal( item1 );
				expect( collection.remove( 'yy' ) ).to.equal( item2 );
			} );
		} );
	} );

	describe( 'length', () => {
		it( 'should return collection length', () => {
			expect( collection.length ).to.equal( 0 );

			collection.add( { foo: 'bar' } );

			expect( collection.length ).to.equal( 1 );
		} );
	} );

	describe( 'first', () => {
		it( 'should return the first item from the collection', () => {
			const item1 = { foo: 'bar' };
			const item2 = { bar: 'biz' };

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.first ).to.equal( item1 );
		} );

		it( 'should return null when collection is empty', () => {
			expect( collection.first ).to.null;
		} );
	} );

	describe( 'last', () => {
		it( 'should return the last item from the collection', () => {
			const item1 = { foo: 'bar' };
			const item2 = { bar: 'biz' };

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.last ).to.equal( item2 );
		} );

		it( 'should return null when collection is empty', () => {
			expect( collection.last ).to.null;
		} );
	} );

	describe( 'add()', () => {
		it( 'should proxy its calls to addMany', () => {
			const spy = sinon.spy( collection, 'addMany' );
			const item = {};

			collection.add( item );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.array.contains( [ item ] ), undefined );
		} );

		it( 'should proxy custom index', () => {
			const stub = sinon.stub( collection, 'addMany' );
			const item = {};

			collection.add( item, 5 );

			sinon.assert.calledOnce( stub );
			sinon.assert.calledWithExactly( stub, sinon.match.any, 5 );
		} );

		it( 'should proxy returned value', () => {
			const expectedReturn = {};
			sinon.stub( collection, 'addMany' ).returns( expectedReturn );

			expect( collection.add( 1 ) ).to.equal( expectedReturn );
		} );

		it( 'should change the length', () => {
			expect( collection ).to.have.length( 0 );

			collection.add( {} );
			expect( collection ).to.have.length( 1 );

			collection.add( {} );
			expect( collection ).to.have.length( 2 );
		} );
	} );

	describe( 'addMany()', () => {
		it( 'should be chainable', () => {
			expect( collection.addMany( [ {} ] ) ).to.equal( collection );
		} );

		it( 'should change the length', () => {
			expect( collection ).to.have.length( 0 );

			collection.addMany( [ {}, {} ] );
			expect( collection ).to.have.length( 2 );

			collection.addMany( [ {} ] );
			expect( collection ).to.have.length( 3 );
		} );

		it( 'should enable get( index )', () => {
			const item1 = {};
			const item2 = {};

			collection.addMany( [ item1, item2 ] );
			expect( collection.get( 0 ) ).to.equal( item1 );
			expect( collection.get( 1 ) ).to.equal( item2 );
		} );

		it( 'should enable get( id )', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );

			collection.addMany( [ item1, item2 ] );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should enable get( id ) - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item1 = getItem( 'foo', 'name' );
			const item2 = getItem( 'bar', 'name' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should generate an id when not defined', () => {
			const item = {};

			collection.addMany( [ item ] );

			expect( item.id ).to.be.a( 'string' );
			expect( collection.get( item.id ) ).to.equal( item );
		} );

		it( 'should generate an id when not defined - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item = {};

			collection.addMany( [ item ] );

			expect( item.name ).to.be.a( 'string' );
			expect( collection.get( item.name ) ).to.equal( item );
		} );

		it( 'should not change an existing id of an item', () => {
			const item = getItem( 'foo' );

			collection.addMany( [ item ] );

			expect( item.id ).to.equal( 'foo' );
		} );

		it( 'should throw when item with this id already exists - single call', () => {
			const item1 = getItem( 'foo' );

			expectToThrowCKEditorError( () => {
				collection.addMany( [ item1, item1 ] );
			}, /^collection-add-item-already-exists/ );
		} );

		it( 'should throw when item with this id already exists - multiple calls', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'foo' );

			collection.addMany( [ item1 ] );

			expectToThrowCKEditorError( () => {
				collection.addMany( [ item2 ] );
			}, /^collection-add-item-already-exists/ );
		} );

		it( 'should throw when item\'s id is not a string', () => {
			const item = { id: 1 };

			expectToThrowCKEditorError( () => {
				collection.addMany( [ item ] );
			}, /^collection-add-invalid-id/ );
		} );

		it(
			'should generate an id when not defined, which is globally unique ' +
			'so it is possible to move items between collections and avoid id collisions',
			() => {
				const collectionA = new Collection();
				const collectionB = new Collection();
				const itemA = {};
				const itemB = {};

				collectionA.addMany( [ itemA ] );
				collectionB.addMany( [ itemB ] );
				collectionB.addMany( [ collectionA.remove( itemA ) ] );

				expect( collectionA.length ).to.equal( 0 );
				expect( collectionB.length ).to.equal( 2 );
				expect( collectionB.get( 0 ) ).to.equal( itemB );
				expect( collectionB.get( 1 ) ).to.equal( itemA );

				expect( itemA.id ).to.not.equal( itemB.id );
			}
		);

		it(
			'should generate an id when not defined, which is globally unique ' +
			'so it is possible to move items between collections and avoid id collisions ' +
			'– custom id property',
			() => {
				const collectionA = new Collection( { idProperty: 'foo' } );
				const collectionB = new Collection( { idProperty: 'foo' } );
				const itemA = {};
				const itemB = {};

				collectionA.addMany( [ itemA ] );
				collectionB.addMany( [ itemB ] );
				collectionB.addMany( [ collectionA.remove( itemA ) ] );

				expect( collectionA.length ).to.equal( 0 );
				expect( collectionB.length ).to.equal( 2 );
				expect( collectionB.get( 0 ) ).to.equal( itemB );
				expect( collectionB.get( 1 ) ).to.equal( itemA );

				expect( itemA.foo ).to.not.equal( itemB.foo );
			}
		);

		it( 'should allow an item which is already in some other collection', () => {
			const collectionA = new Collection();
			const collectionB = new Collection();
			const item = {};

			collectionA.addMany( [ item ] );
			collectionB.addMany( [ item ] );

			expect( collectionA.length ).to.equal( 1 );
			expect( collectionB.length ).to.equal( 1 );
			expect( collectionA.get( item.id ) ).to.equal( collectionB.get( 0 ) );
		} );

		it( 'should fire the "add" event', () => {
			const spy = sinon.spy();
			const item = {};

			collection.on( 'add', spy );

			collection.addMany( [ item ] );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item, 0 );
		} );

		it( 'should fire the "add" event for each item', () => {
			const spy = sinon.spy();
			const items = [ {}, {} ];

			collection.on( 'add', spy );

			collection.addMany( items );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), items[ 0 ], 0 );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), items[ 1 ], 1 );

			expect( spy.callCount ).to.equal( 2 );
		} );

		it( 'should fire the "add" event with the index argument', () => {
			const spy = sinon.spy();

			collection.addMany( [ {} ] );
			collection.addMany( [ {} ] );

			collection.on( 'add', spy );

			const item = {};
			collection.addMany( [ item ], 1 );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item, 1 );
		} );

		it( 'should fire the "addBatch" event', () => {
			const spy = sinon.spy();
			const items = [ {}, {} ];

			collection.on( 'addBatch', spy );

			collection.addMany( items );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), items, 0 );
		} );

		it( 'should fire the "addBatch" event with the index argument', () => {
			const spy = sinon.spy();
			const firstBatch = [ {}, {} ];
			const secondBatch = [ {}, {} ];

			collection.addMany( firstBatch );

			collection.on( 'addBatch', spy );

			collection.addMany( secondBatch, 1 );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), secondBatch, 1 );
		} );

		it( 'should support an optional index argument', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'baz' );
			const item4 = getItem( 'abc' );

			collection.addMany( [ item1 ] );
			collection.addMany( [ item2 ], 0 );
			collection.addMany( [ item3 ], 1 );
			collection.addMany( [ item4 ], 3 );

			expect( collection.get( 0 ) ).to.equal( item2 );
			expect( collection.get( 1 ) ).to.equal( item3 );
			expect( collection.get( 2 ) ).to.equal( item1 );
			expect( collection.get( 3 ) ).to.equal( item4 );
		} );

		it( 'should throw when index argument is invalid', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'baz' );

			collection.addMany( [ item1 ] );

			expectToThrowCKEditorError( () => {
				collection.addMany( [ item2 ], -1 );
			}, /^collection-add-item-invalid-index/ );

			expectToThrowCKEditorError( () => {
				collection.addMany( [ item2 ], 2 );
			}, /^collection-add-item-invalid-index/ );

			collection.addMany( [ item2 ], 1 );
			collection.addMany( [ item3 ], 0 );

			expect( collection.length ).to.equal( 3 );
		} );
	} );

	describe( 'get()', () => {
		it( 'should return an item', () => {
			const item = getItem( 'foo' );
			collection.add( item );

			expect( collection.get( 'foo' ) ).to.equal( item );
		} );

		it( 'should return null if id does not exist', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.get( 'bar' ) ).to.be.null;
		} );

		it( 'should throw if neither string or number given', () => {
			expectToThrowCKEditorError( () => {
				collection.get( true );
			}, /^collection-get-invalid-arg/ );
		} );
	} );

	describe( 'has()', () => {
		it( 'should return true if collection contains item with given id', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.has( 'foo' ) ).to.equal( true );
		} );

		it( 'should return false if collection does not contain item with given id', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.has( 'bar' ) ).to.equal( false );
		} );

		it( 'should return true if collection contains item', () => {
			const item = getItem( 'foo' );

			collection.add( item );

			expect( collection.has( item ) ).to.equal( true );
		} );

		it( 'should return false if collection does not contains item', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.has( getItem( 'bar' ) ) ).to.equal( false );
		} );
	} );

	describe( 'getIndex()', () => {
		it( 'should return index of given item', () => {
			const item1 = { foo: 'bar' };
			const item2 = { bar: 'biz' };
			const item3 = { foo: 'biz' };

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			expect( collection.getIndex( item1 ) ).to.equal( 0 );
			expect( collection.getIndex( item2 ) ).to.equal( 1 );
			expect( collection.getIndex( item3 ) ).to.equal( 2 );
		} );

		it( 'should return index of item with given id', () => {
			collection.add( { id: 'id1' } );
			collection.add( { id: 'id2' } );
			collection.add( { id: 'id3' } );

			expect( collection.getIndex( 'id1' ) ).to.equal( 0 );
			expect( collection.getIndex( 'id2' ) ).to.equal( 1 );
			expect( collection.getIndex( 'id3' ) ).to.equal( 2 );
		} );

		it( 'should return index equal to -1 when given item is not defined in the collection', () => {
			const item1 = { foo: 'bar' };

			expect( collection.getIndex( item1 ) ).to.equal( -1 );
		} );

		it( 'should return index equal to -1 when item of given id is not defined in the collection', () => {
			expect( collection.getIndex( 'id1' ) ).to.equal( -1 );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove the model by index', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			const removedItem = collection.remove( 1 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by index - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );

			collection.add( getItem( 'foo', 'name' ) );

			const removedItem = collection.remove( 0 );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should remove the model by id', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			const removedItem = collection.remove( 'foo' );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by model', () => {
			const item = getItem( 'foo' );

			collection.add( getItem( 'bom' ) );
			collection.add( item );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			const removedItem = collection.remove( item );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.equal( item );
		} );

		it( 'should remove the model by model - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item = getItem( 'foo', 'name' );

			collection.add( item );

			const removedItem = collection.remove( item );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should fire the "remove" event', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'bom' );

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			const spy = sinon.spy();

			collection.on( 'remove', spy );

			collection.remove( 1 );		// by index
			collection.remove( item1 );	// by model
			collection.remove( 'bom' );	// by id

			sinon.assert.calledThrice( spy );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item1, 0 );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item2, 1 );
			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item3, 0 );
		} );

		it( 'should throw an error on invalid index', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( 1 );
			}, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );

		it( 'should throw an error on invalid id', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( 'bar' );
			}, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );

		it( 'should throw an error on invalid model', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( getItem( 'bar' ) );
			}, /^collection-remove-404/ );

			expect( collection ).to.have.length( 1 );
		} );
	} );

	describe( 'map()', () => {
		it( 'uses native map', () => {
			const spy = testUtils.sinon.stub( Array.prototype, 'map' ).returns( [ 'foo' ] );
			const ctx = {};

			const ret = collection.map( callback, ctx );

			sinon.assert.calledWithExactly( spy, callback, ctx );
			expect( ret ).to.deep.equal( [ 'foo' ], 'ret value was forwarded' );

			function callback() {}
		} );
	} );

	describe( 'find()', () => {
		it( 'uses native find', () => {
			const needl = getItem( 'foo' );

			const spy = testUtils.sinon.stub( Array.prototype, 'find' ).returns( needl );
			const ctx = {};

			const ret = collection.find( callback, ctx );

			sinon.assert.calledWithExactly( spy, callback, ctx );
			expect( ret ).to.equal( needl, 'ret value was forwarded' );

			function callback() {}
		} );
	} );

	describe( 'filter()', () => {
		it( 'uses native filter', () => {
			const needl = getItem( 'foo' );

			// See: https://github.com/sinonjs/sinon/issues/1521
			const spy = testUtils.sinon.stub( collection._items, 'filter' ).returns( [ needl ] );
			const ctx = {};

			const ret = collection.filter( callback, ctx );

			sinon.assert.calledWithExactly( spy, callback, ctx );
			expect( ret ).to.deep.equal( [ needl ], 'ret value was forwarded' );

			function callback() {}
		} );
	} );

	describe( 'clear()', () => {
		it( 'removes all items', () => {
			const items = [ {}, {}, {} ];
			const spy = sinon.spy();

			collection.on( 'remove', spy );

			items.forEach( i => collection.add( i ) );

			collection.clear();

			expect( spy.callCount ).to.equal( 3 );
			expect( collection.length ).to.equal( 0 );
		} );

		it( 'breaks the binding', () => {
			const external = new Collection();
			collection.bindTo( external ).using( i => i );

			external.add( { foo: 'bar' } );
			expect( collection ).to.have.length( 1 );

			collection.clear();

			external.add( { foo: 'baz' } );
			expect( collection ).to.have.length( 0 );

			external.remove( 0 );
			expect( collection ).to.have.length( 0 );

			expect( collection._bindToCollection ).to.be.null;
		} );
	} );

	describe( 'bindTo()', () => {
		class FactoryClass {
			constructor( data ) {
				this.data = data;
			}
		}

		function assertItems( collection, expectedItems ) {
			expect( collection.map( i => i.v ) ).to.deep.equal( expectedItems );
		}

		it( 'throws when binding more than once', () => {
			collection.bindTo( {} );

			expectToThrowCKEditorError( () => {
				collection.bindTo( {} );
			}, /^collection-bind-to-rebind/ );
		} );

		it( 'provides "using()" and "as()" interfaces', () => {
			const returned = collection.bindTo( {} );

			expect( returned ).to.have.keys( 'using', 'as' );
			expect( returned.using ).to.be.a( 'function' );
			expect( returned.as ).to.be.a( 'function' );
		} );

		it( 'stores reference to bound collection', () => {
			const collectionB = new Collection();

			expect( collection._bindToCollection ).to.be.undefined;
			expect( collectionB._bindToCollection ).to.be.undefined;

			collection.bindTo( collectionB ).as( FactoryClass );

			expect( collection._bindToCollection ).to.equal( collectionB );
			expect( collectionB._bindToCollection ).to.be.undefined;
		} );

		describe( 'as()', () => {
			let items;

			beforeEach( () => {
				items = new Collection();
			} );

			it( 'does not chain', () => {
				const returned = collection.bindTo( new Collection() ).as( FactoryClass );

				expect( returned ).to.be.undefined;
			} );

			it( 'creates a binding (initial content)', () => {
				items.add( { id: '1' } );
				items.add( { id: '2' } );

				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).to.have.length( 2 );
				expect( collection.get( 0 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).to.equal( items.get( 1 ) );
			} );

			it( 'creates a binding (new content)', () => {
				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).to.have.length( 0 );

				items.add( { id: '1' } );
				items.add( { id: '2' } );

				expect( collection ).to.have.length( 2 );
				expect( collection.get( 0 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).to.equal( items.get( 1 ) );
			} );

			it( 'creates a binding (item removal)', () => {
				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).to.have.length( 0 );

				items.add( { id: '1' } );
				items.add( { id: '2' } );

				expect( collection ).to.have.length( 2 );
				expect( collection.get( 0 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ) ).to.be.instanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).to.equal( items.get( 1 ) );

				items.remove( 1 );
				expect( collection.get( 0 ).data ).to.equal( items.get( 0 ) );

				items.remove( 0 );
				expect( collection ).to.have.length( 0 );
			} );
		} );

		describe( 'using()', () => {
			let items;

			beforeEach( () => {
				items = new Collection();
			} );

			it( 'does not chain', () => {
				const returned = collection.bindTo( new Collection() ).using( () => {} );

				expect( returned ).to.be.undefined;
			} );

			describe( 'callback', () => {
				it( 'creates a binding (arrow function)', () => {
					collection.bindTo( items ).using( item => {
						return new FactoryClass( item );
					} );

					expect( collection ).to.have.length( 0 );

					items.add( { id: '1' } );
					items.add( { id: '2' } );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ) ).to.be.instanceOf( FactoryClass );
					expect( collection.get( 1 ) ).to.be.instanceOf( FactoryClass );
					expect( collection.get( 1 ).data ).to.equal( items.get( 1 ) );
				} );

				// https://github.com/ckeditor/ckeditor5-ui/issues/113
				it( 'creates a binding (normal function)', () => {
					collection.bindTo( items ).using( function( item ) {
						return new FactoryClass( item );
					} );

					items.add( { id: '1' } );

					expect( collection ).to.have.length( 1 );

					const view = collection.get( 0 );

					// Wrong args will be passed to the callback if it's treated as the view constructor.
					expect( view ).to.be.instanceOf( FactoryClass );
					expect( view.data ).to.equal( items.get( 0 ) );
				} );

				it( 'creates a 1:1 binding', () => {
					collection.bindTo( items ).using( item => item );

					expect( collection ).to.have.length( 0 );

					const item1 = { id: '100' };
					const item2 = { id: '200' };

					items.add( item1 );
					items.add( item2 );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ) ).to.equal( item1 );
					expect( collection.get( 1 ) ).to.equal( item2 );
				} );

				it( 'creates a conditional binding', () => {
					class CustomClass {
						constructor( data ) {
							this.data = data;
						}
					}

					collection.bindTo( items ).using( item => {
						if ( item.id == 'FactoryClass' ) {
							return new FactoryClass( item );
						} else {
							return new CustomClass( item );
						}
					} );

					expect( collection ).to.have.length( 0 );

					const item1 = { id: 'FactoryClass' };
					const item2 = { id: 'CustomClass' };

					items.add( item1 );
					items.add( item2 );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ) ).to.be.instanceOf( FactoryClass );
					expect( collection.get( 1 ) ).to.be.instanceOf( CustomClass );
				} );

				it( 'creates a binding to a property name', () => {
					collection.bindTo( items ).using( item => item.prop );

					expect( collection ).to.have.length( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ).value ).to.equal( 'foo' );
					expect( collection.get( 1 ).value ).to.equal( 'bar' );
				} );

				it( 'skips when there is no item', () => {
					// Add before collection is bound.
					items.add( { value: 1, skip: true } );

					expect( collection ).to.have.length( 0 );

					collection.bindTo( items ).using( item => {
						if ( item.skip ) {
							return null;
						}

						return item;
					} );

					// Still 0 because initial item was skipped.
					expect( collection ).to.have.length( 0 );

					items.add( { value: 2, skip: false } );
					items.add( { value: 3, skip: true } );
					items.add( { value: 4, skip: false } );

					expect( Array.from( collection, item => item.value ) ).to.deep.equal( [ 2, 4 ] );

					items.add( { value: 5, skip: false }, 2 );

					expect( Array.from( collection, item => item.value ) ).to.deep.equal( [ 2, 5, 4 ] );
				} );
			} );

			describe( 'property name', () => {
				it( 'creates a binding', () => {
					collection.bindTo( items ).using( 'prop' );

					expect( collection ).to.have.length( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ).value ).to.equal( 'foo' );
					expect( collection.get( 1 ).value ).to.equal( 'bar' );
				} );

				it( 'creates a binding (item removal)', () => {
					collection.bindTo( items ).using( 'prop' );

					expect( collection ).to.have.length( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).to.have.length( 2 );
					expect( collection.get( 0 ).value ).to.equal( 'foo' );
					expect( collection.get( 1 ).value ).to.equal( 'bar' );

					items.remove( 1 );
					expect( collection ).to.have.length( 1 );
					expect( collection.get( 0 ).value ).to.equal( 'foo' );

					items.remove( 0 );
					expect( collection ).to.have.length( 0 );
				} );

				it( 'skips when there is no item', () => {
					items.add( { prop: null } );

					collection.bindTo( items ).using( 'prop' );

					// Still 0 because initial item was skipped.
					expect( collection ).to.have.length( 0 );

					items.add( { prop: { value: 2, skip: false } } );
					items.add( { prop: null } );
					items.add( { prop: { value: 4, skip: false } } );

					expect( Array.from( collection, item => item.value ) ).to.deep.equal( [ 2, 4 ] );

					items.add( { prop: { value: 5 } }, 2 );

					expect( Array.from( collection, item => item.value ) ).to.deep.equal( [ 2, 5, 4 ] );
				} );
			} );
		} );

		describe( 'two–way data binding', () => {
			it( 'works with custom factories (1)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( i => ( { v: i.v * 2 } ) );
				collectionB.bindTo( collectionA ).using( i => ( { v: i.v / 2 } ) );

				assertItems( collectionA, [] );
				assertItems( collectionB, [] );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				assertItems( collectionA, [ 4, 6 ] );
				assertItems( collectionB, [ 2, 3 ] );

				collectionB.add( { v: 4 } );

				assertItems( collectionA, [ 4, 6, 8 ] );
				assertItems( collectionB, [ 2, 3, 4 ] );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
			} );

			it( 'works with custom factories (2)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( 'data' );
				collectionB.bindTo( collectionA ).using( i => new FactoryClass( i ) );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				expect( [ ...collectionB ].every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( [ ...collectionB ].map( i => i.data ) ).to.deep.equal( [ ...collectionA ] );
				expect( collectionB.map( i => i.data.v ) ).to.deep.equal( [ 4, 6 ] );
				expect( collectionA.map( i => i.v ) ).to.deep.equal( [ 4, 6 ] );

				collectionB.add( new FactoryClass( { v: 8 } ) );

				expect( [ ...collectionB ].every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( [ ...collectionB ].map( i => i.data ) ).to.deep.equal( [ ...collectionA ] );
				expect( collectionB.map( i => i.data.v ) ).to.deep.equal( [ 4, 6, 8 ] );
				expect( collectionA.map( i => i.v ) ).to.deep.equal( [ 4, 6, 8 ] );
			} );

			it( 'works with custom factories (custom index)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( i => ( { v: i.v * 2 } ) );
				collectionB.bindTo( collectionA ).using( i => ( { v: i.v / 2 } ) );

				assertItems( collectionA, [] );
				assertItems( collectionB, [] );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 }, 0 );

				assertItems( collectionA, [ 6, 4 ] );
				assertItems( collectionB, [ 3, 2 ] );

				collectionB.add( { v: 4 }, 1 );

				assertItems( collectionA, [ 6, 8, 4 ] );
				assertItems( collectionB, [ 3, 4, 2 ] );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
			} );

			it( 'works with 1:1 binding', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( i => i );
				collectionB.bindTo( collectionA ).using( i => i );

				assertItems( collectionA, [], [] );
				assertItems( collectionB, [], [] );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				assertItems( collectionA, [ 4, 6 ] );
				assertItems( collectionB, [ 4, 6 ] );

				collectionB.add( { v: 8 } );

				assertItems( collectionA, [ 4, 6, 8 ] );
				assertItems( collectionB, [ 4, 6, 8 ] );

				expect( [ ...collectionA ] ).to.deep.equal( [ ...collectionB ] );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
			} );

			it( 'works with double chaining', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();
				const collectionC = new Collection();

				const spyA = sinon.spy();
				const spyB = sinon.spy();
				const spyC = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );
				collectionC.on( 'add', spyC );

				// A<--->B--->C
				collectionA.bindTo( collectionB ).using( i => ( { v: i.v * 2 } ) );
				collectionB.bindTo( collectionA ).using( i => ( { v: i.v / 2 } ) );
				collectionC.bindTo( collectionB ).using( i => ( { v: -i.v } ) );

				assertItems( collectionA, [] );
				assertItems( collectionB, [] );
				assertItems( collectionC, [] );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				assertItems( collectionA, [ 4, 6 ] );
				assertItems( collectionB, [ 2, 3 ] );
				assertItems( collectionC, [ -2, -3 ] );

				collectionB.add( { v: 4 } );

				assertItems( collectionA, [ 4, 6, 8 ] );
				assertItems( collectionB, [ 2, 3, 4 ] );
				assertItems( collectionC, [ -2, -3, -4 ] );

				collectionC.add( { v: -1000 } );

				assertItems( collectionA, [ 4, 6, 8 ] );
				assertItems( collectionB, [ 2, 3, 4 ] );
				assertItems( collectionC, [ -2, -3, -4, -1000 ] );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
				sinon.assert.callCount( spyC, 4 );
			} );

			it( 'removes items correctly', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyAddA = sinon.spy();
				const spyAddB = sinon.spy();
				const spyRemoveA = sinon.spy();
				const spyRemoveB = sinon.spy();

				collectionA.on( 'add', spyAddA );
				collectionB.on( 'add', spyAddB );
				collectionA.on( 'remove', spyRemoveA );
				collectionB.on( 'remove', spyRemoveB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( i => ( { v: i.v * 2 } ) );
				collectionB.bindTo( collectionA ).using( i => ( { v: i.v / 2 } ) );

				assertItems( collectionA, [], [] );
				assertItems( collectionB, [], [] );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				assertItems( collectionA, [ 4, 6 ] );
				assertItems( collectionB, [ 2, 3 ] );

				collectionB.add( { v: 4 } );

				assertItems( collectionA, [ 4, 6, 8 ] );
				assertItems( collectionB, [ 2, 3, 4 ] );

				collectionB.remove( 0 );

				assertItems( collectionA, [ 6, 8 ] );
				assertItems( collectionB, [ 3, 4 ] );

				sinon.assert.callCount( spyAddA, 3 );
				sinon.assert.callCount( spyAddB, 3 );
				sinon.assert.callCount( spyRemoveA, 1 );
				sinon.assert.callCount( spyRemoveB, 1 );

				collectionA.remove( 1 );

				assertItems( collectionA, [ 6 ] );
				assertItems( collectionB, [ 3 ] );

				sinon.assert.callCount( spyAddA, 3 );
				sinon.assert.callCount( spyAddB, 3 );
				sinon.assert.callCount( spyRemoveA, 2 );
				sinon.assert.callCount( spyRemoveB, 2 );
			} );

			describe( 'skipping items', () => {
				let collectionA, collectionB;

				beforeEach( () => {
					collectionA = new Collection();
					collectionB = new Collection();

					// A<--->B
					collectionA.bindTo( collectionB ).using( item => {
						if ( item.skip ) {
							return null;
						}

						return item;
					} );

					collectionB.bindTo( collectionA ).using( item => {
						if ( item.skip ) {
							return null;
						}

						return item;
					} );
				} );

				it( 'should add items at the enf of collections when includes skipped items', () => {
					collectionA.add( { v: 'A' } );
					collectionA.add( { v: 'B', skip: true } );
					collectionA.add( { v: 'C', skip: true } );
					collectionA.add( { v: 'D' } );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D' ] );
					assertItems( collectionB, [ 'A', 'D' ] );

					collectionB.add( { v: 'E' } );
					collectionB.add( { v: 'F', skip: true } );
					collectionB.add( { v: 'G' } );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 3 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D', 'E', 'G' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G' ] );
				} );

				it( 'should add items between skipped items', () => {
					collectionA.add( { v: 'A' } );
					collectionA.add( { v: 'B', skip: true } );
					collectionA.add( { v: 'C', skip: true } );
					collectionA.add( { v: 'D' } );

					collectionB.add( { v: 'E' } );
					collectionB.add( { v: 'F', skip: true } );
					collectionB.add( { v: 'G', skip: true } );
					collectionB.add( { v: 'H' } );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 3, 4 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionA.add( { v: 'I' }, 2 );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 4, 5 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'I', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'I', 'D', 'E', 'F', 'G', 'H' ] );

					collectionB.add( { v: 'J' }, 5 );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 4, 5 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'I', 'C', 'D', 'E', 'J', 'H' ] );
					assertItems( collectionB, [ 'A', 'I', 'D', 'E', 'F', 'J', 'G', 'H' ] );
				} );

				it( 'should properly remove skipped items and update skipped indexes', () => {
					collectionA.add( { v: 'A' } );
					collectionA.add( { v: 'B', skip: true } );
					collectionA.add( { v: 'C', skip: true } );
					collectionA.add( { v: 'D' } );

					collectionB.add( { v: 'E' } );
					collectionB.add( { v: 'F', skip: true } );
					collectionB.add( { v: 'G', skip: true } );
					collectionB.add( { v: 'H' } );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 3, 4 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionA.remove( 2 );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 3, 4 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1 ] );
					assertItems( collectionA, [ 'A', 'B', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionB.remove( 3 );

					expect( collectionA._skippedIndexesFromExternal ).to.have.members( [ 3 ] );
					expect( collectionB._skippedIndexesFromExternal ).to.have.members( [ 1 ] );
					assertItems( collectionA, [ 'A', 'B', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'G', 'H' ] );
				} );
			} );
		} );
	} );

	describe( 'iterator', () => {
		it( 'covers the whole collection', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'bom' );
			const items = [];

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			for ( const item of collection ) {
				items.push( item.id );
			}

			expect( items ).to.deep.equal( [ 'foo', 'bar', 'bom' ] );
		} );
	} );
} );
