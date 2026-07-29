/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Collection } from '../src/collection.js';
import { expectToThrowCKEditorError } from '../tests/_utils/utils.js';

function getItem( id, idProperty ) {
	idProperty = idProperty || 'id';

	return {
		[ idProperty ]: id
	};
}

describe( 'Collection', () => {
	let collection;

	beforeEach( () => {
		collection = new Collection();
	} );

	describe( 'constructor()', () => {
		describe( 'setting initial collection items', () => {
			it( 'should work using an array', () => {
				const item1 = getItem( 'foo' );
				const item2 = getItem( 'bar' );
				const collection = new Collection( [ item1, item2 ] );

				expect( collection ).toHaveLength( 2 );

				expect( collection.get( 0 ) ).toBe( item1 );
				expect( collection.get( 1 ) ).toBe( item2 );
				expect( collection.get( 'foo' ) ).toBe( item1 );
				expect( collection.get( 'bar' ) ).toBe( item2 );
			} );

			it( 'should work using an iterable', () => {
				const item1 = getItem( 'foo' );
				const item2 = getItem( 'bar' );
				const itemsSet = new Set( [ item1, item2 ] );
				const collection = new Collection( itemsSet );

				expect( collection ).toHaveLength( 2 );

				expect( collection.get( 0 ) ).toBe( item1 );
				expect( collection.get( 1 ) ).toBe( item2 );
			} );

			it( 'should generate ids for items that doesn\'t have it', () => {
				const item = {};
				const collection = new Collection( [ item ] );

				expect( collection.get( 0 ).id ).toBeTypeOf( 'string' );
				expect( collection.get( 0 ).id ).not.toBe( '' );
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

				expect( collection ).toHaveLength( 2 );

				expect( collection.get( 'xx' ) ).toBe( item1 );
				expect( collection.remove( 'yy' ) ).toBe( item2 );
			} );

			it( 'should allow to change the id property used by the collection (initial items passed to the constructor)', () => {
				const item1 = { id: 'foo', name: 'xx' };
				const item2 = { id: 'foo', name: 'yy' };
				const collection = new Collection( [ item1, item2 ], { idProperty: 'name' } );

				expect( collection ).toHaveLength( 2 );

				expect( collection.get( 'xx' ) ).toBe( item1 );
				expect( collection.remove( 'yy' ) ).toBe( item2 );
			} );
		} );
	} );

	describe( 'length', () => {
		it( 'should return collection length', () => {
			expect( collection.length ).toBe( 0 );

			collection.add( { foo: 'bar' } );

			expect( collection.length ).toBe( 1 );
		} );
	} );

	describe( 'first', () => {
		it( 'should return the first item from the collection', () => {
			const item1 = { foo: 'bar' };
			const item2 = { bar: 'biz' };

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.first ).toBe( item1 );
		} );

		it( 'should return null when collection is empty', () => {
			expect( collection.first ).toBeNull();
		} );
	} );

	describe( 'last', () => {
		it( 'should return the last item from the collection', () => {
			const item1 = { foo: 'bar' };
			const item2 = { bar: 'biz' };

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.last ).toBe( item2 );
		} );

		it( 'should return null when collection is empty', () => {
			expect( collection.last ).toBeNull();
		} );
	} );

	describe( 'add()', () => {
		it( 'should be chainable', () => {
			expect( collection.add( {} ) ).toBe( collection );
		} );

		it( 'should change the length', () => {
			expect( collection ).toHaveLength( 0 );

			collection.add( {} );
			expect( collection ).toHaveLength( 1 );

			collection.add( {} );
			expect( collection ).toHaveLength( 2 );
		} );

		it( 'should enable get( index )', () => {
			const item1 = {};
			const item2 = {};

			collection.add( item1 );
			expect( collection.get( 0 ) ).toBe( item1 );

			collection.add( item2 );
			expect( collection.get( 0 ) ).toBe( item1 );
			expect( collection.get( 1 ) ).toBe( item2 );
		} );

		it( 'should enable get( id )', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).toBe( item1 );
			expect( collection.get( 'bar' ) ).toBe( item2 );
		} );

		it( 'should enable get( id ) - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item1 = getItem( 'foo', 'name' );
			const item2 = getItem( 'bar', 'name' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).toBe( item1 );
			expect( collection.get( 'bar' ) ).toBe( item2 );
		} );

		it( 'should generate an id when not defined', () => {
			const item = {};

			collection.add( item );

			expect( item.id ).toBeTypeOf( 'string' );
			expect( collection.get( item.id ) ).toBe( item );
		} );

		it( 'should generate an id when not defined - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item = {};

			collection.add( item );

			expect( item.name ).toBeTypeOf( 'string' );
			expect( collection.get( item.name ) ).toBe( item );
		} );

		it( 'should not change an existing id of an item', () => {
			const item = getItem( 'foo' );

			collection.add( item );

			expect( item.id ).toBe( 'foo' );
		} );

		it( 'should throw when item with this id already exists', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'foo' );

			collection.add( item1 );

			expectToThrowCKEditorError( () => {
				collection.add( item2 );
			}, /^collection-add-item-already-exists/ );
		} );

		it( 'should throw when item\'s id is not a string', () => {
			const item = { id: 1 };

			expectToThrowCKEditorError( () => {
				collection.add( item );
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

				collectionA.add( itemA );
				collectionB.add( itemB );
				collectionB.add( collectionA.remove( itemA ) );

				expect( collectionA.length ).toBe( 0 );
				expect( collectionB.length ).toBe( 2 );
				expect( collectionB.get( 0 ) ).toBe( itemB );
				expect( collectionB.get( 1 ) ).toBe( itemA );

				expect( itemA.id ).not.toBe( itemB.id );
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

				collectionA.add( itemA );
				collectionB.add( itemB );
				collectionB.add( collectionA.remove( itemA ) );

				expect( collectionA.length ).toBe( 0 );
				expect( collectionB.length ).toBe( 2 );
				expect( collectionB.get( 0 ) ).toBe( itemB );
				expect( collectionB.get( 1 ) ).toBe( itemA );

				expect( itemA.foo ).not.toBe( itemB.foo );
			}
		);

		it( 'should allow an item which is already in some other collection', () => {
			const collectionA = new Collection();
			const collectionB = new Collection();
			const item = {};

			collectionA.add( item );
			collectionB.add( item );

			expect( collectionA.length ).toBe( 1 );
			expect( collectionB.length ).toBe( 1 );
			expect( collectionA.get( item.id ) ).toBe( collectionB.get( 0 ) );
		} );

		it( 'should fire the "add" event', () => {
			const spy = vi.fn();
			const item = {};

			collection.on( 'add', spy );

			collection.add( item );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item, 0 );
		} );

		it( 'should support an optional index argument', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'baz' );
			const item4 = getItem( 'abc' );

			collection.add( item1 );
			collection.add( item2, 0 );
			collection.add( item3, 1 );
			collection.add( item4, 3 );

			expect( collection.get( 0 ) ).toBe( item2 );
			expect( collection.get( 1 ) ).toBe( item3 );
			expect( collection.get( 2 ) ).toBe( item1 );
			expect( collection.get( 3 ) ).toBe( item4 );
		} );

		it( 'should throw when index argument is invalid', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'baz' );

			collection.add( item1 );

			expectToThrowCKEditorError( () => {
				collection.add( item2, -1 );
			}, /^collection-add-item-invalid-index/ );

			expectToThrowCKEditorError( () => {
				collection.add( item2, 2 );
			}, /^collection-add-item-invalid-index/ );

			collection.add( item2, 1 );
			collection.add( item3, 0 );

			expect( collection.length ).toBe( 3 );
		} );

		it( 'should fire the "add" event with the index argument', () => {
			const spy = vi.fn();

			collection.add( {} );
			collection.add( {} );

			collection.on( 'add', spy );

			const item = {};
			collection.add( item, 1 );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item, 1 );
		} );
	} );

	describe( 'addMany()', () => {
		it( 'should be chainable', () => {
			expect( collection.addMany( [ {} ] ) ).toBe( collection );
		} );

		it( 'should change the length', () => {
			expect( collection ).toHaveLength( 0 );

			collection.addMany( [ {}, {} ] );
			expect( collection ).toHaveLength( 2 );

			collection.addMany( [ {} ] );
			expect( collection ).toHaveLength( 3 );
		} );

		it( 'should enable get( index )', () => {
			const item1 = {};
			const item2 = {};

			collection.addMany( [ item1, item2 ] );
			expect( collection.get( 0 ) ).toBe( item1 );
			expect( collection.get( 1 ) ).toBe( item2 );
		} );

		it( 'should enable get( id )', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );

			collection.addMany( [ item1, item2 ] );

			expect( collection.get( 'foo' ) ).toBe( item1 );
			expect( collection.get( 'bar' ) ).toBe( item2 );
		} );

		it( 'should enable get( id ) - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item1 = getItem( 'foo', 'name' );
			const item2 = getItem( 'bar', 'name' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).toBe( item1 );
			expect( collection.get( 'bar' ) ).toBe( item2 );
		} );

		it( 'should generate an id when not defined', () => {
			const item = {};

			collection.addMany( [ item ] );

			expect( item.id ).toBeTypeOf( 'string' );
			expect( collection.get( item.id ) ).toBe( item );
		} );

		it( 'should generate an id when not defined - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item = {};

			collection.addMany( [ item ] );

			expect( item.name ).toBeTypeOf( 'string' );
			expect( collection.get( item.name ) ).toBe( item );
		} );

		it( 'should not change an existing id of an item', () => {
			const item = getItem( 'foo' );

			collection.addMany( [ item ] );

			expect( item.id ).toBe( 'foo' );
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

				expect( collectionA.length ).toBe( 0 );
				expect( collectionB.length ).toBe( 2 );
				expect( collectionB.get( 0 ) ).toBe( itemB );
				expect( collectionB.get( 1 ) ).toBe( itemA );

				expect( itemA.id ).not.toBe( itemB.id );
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

				expect( collectionA.length ).toBe( 0 );
				expect( collectionB.length ).toBe( 2 );
				expect( collectionB.get( 0 ) ).toBe( itemB );
				expect( collectionB.get( 1 ) ).toBe( itemA );

				expect( itemA.foo ).not.toBe( itemB.foo );
			}
		);

		it( 'should allow an item which is already in some other collection', () => {
			const collectionA = new Collection();
			const collectionB = new Collection();
			const item = {};

			collectionA.addMany( [ item ] );
			collectionB.addMany( [ item ] );

			expect( collectionA.length ).toBe( 1 );
			expect( collectionB.length ).toBe( 1 );
			expect( collectionA.get( item.id ) ).toBe( collectionB.get( 0 ) );
		} );

		it( 'should fire the "add" event', () => {
			const spy = vi.fn();
			const item = {};

			collection.on( 'add', spy );

			collection.addMany( [ item ] );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item, 0 );
		} );

		it( 'should fire the "add" event for each item', () => {
			const spy = vi.fn();
			const items = [ {}, {} ];

			collection.on( 'add', spy );

			collection.addMany( items );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), items[ 0 ], 0 );
			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), items[ 1 ], 1 );

			expect( spy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should fire the "add" event with the index argument', () => {
			const spy = vi.fn();

			collection.addMany( [ {} ] );
			collection.addMany( [ {} ] );

			collection.on( 'add', spy );

			const item = {};
			collection.addMany( [ item ], 1 );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item, 1 );
		} );

		it( 'should fire the "change" event', () => {
			const spy = vi.fn();
			const items = [ {}, {} ];

			collection.on( 'change', spy );

			collection.addMany( items );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				added: items,
				removed: [],
				index: 0
			} );
		} );

		it( 'should fire the "change" event with the index argument', () => {
			const spy = vi.fn();
			const firstBatch = [ {}, {} ];
			const secondBatch = [ {}, {} ];

			collection.addMany( firstBatch );

			collection.on( 'change', spy );

			collection.addMany( secondBatch, 1 );

			expect( spy, 'call count' ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				added: secondBatch,
				removed: [],
				index: 1
			} );
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

			expect( collection.get( 0 ) ).toBe( item2 );
			expect( collection.get( 1 ) ).toBe( item3 );
			expect( collection.get( 2 ) ).toBe( item1 );
			expect( collection.get( 3 ) ).toBe( item4 );
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

			expect( collection.length ).toBe( 3 );
		} );
	} );

	describe( 'get()', () => {
		it( 'should return an item', () => {
			const item = getItem( 'foo' );
			collection.add( item );

			expect( collection.get( 'foo' ) ).toBe( item );
		} );

		it( 'should return null if id does not exist', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.get( 'bar' ) ).toBeNull();
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

			expect( collection.has( 'foo' ) ).toBe( true );
		} );

		it( 'should return false if collection does not contain item with given id', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.has( 'bar' ) ).toBe( false );
		} );

		it( 'should return true if collection contains item', () => {
			const item = getItem( 'foo' );

			collection.add( item );

			expect( collection.has( item ) ).toBe( true );
		} );

		it( 'should return false if collection does not contains item', () => {
			collection.add( getItem( 'foo' ) );

			expect( collection.has( getItem( 'bar' ) ) ).toBe( false );
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

			expect( collection.getIndex( item1 ) ).toBe( 0 );
			expect( collection.getIndex( item2 ) ).toBe( 1 );
			expect( collection.getIndex( item3 ) ).toBe( 2 );
		} );

		it( 'should return index of item with given id', () => {
			collection.add( { id: 'id1' } );
			collection.add( { id: 'id2' } );
			collection.add( { id: 'id3' } );

			expect( collection.getIndex( 'id1' ) ).toBe( 0 );
			expect( collection.getIndex( 'id2' ) ).toBe( 1 );
			expect( collection.getIndex( 'id3' ) ).toBe( 2 );
		} );

		it( 'should return index equal to -1 when given item is not defined in the collection', () => {
			const item1 = { foo: 'bar' };

			expect( collection.getIndex( item1 ) ).toBe( -1 );
		} );

		it( 'should return index equal to -1 when item of given id is not defined in the collection', () => {
			expect( collection.getIndex( 'id1' ) ).toBe( -1 );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove the model by index', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).toHaveLength( 3 );

			const removedItem = collection.remove( 1 );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 'foo' ) ).toBeNull();
			expect( collection.get( 1 ) ).toHaveProperty( 'id', 'bar' );
			expect( removedItem ).toHaveProperty( 'id', 'foo' );
		} );

		it( 'should remove the model by index - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );

			collection.add( getItem( 'foo', 'name' ) );

			const removedItem = collection.remove( 0 );

			expect( collection ).toHaveLength( 0 );
			expect( collection.get( 'foo' ) ).toBeNull();
			expect( removedItem ).toHaveProperty( 'name', 'foo' );
		} );

		it( 'should remove the model by id', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).toHaveLength( 3 );

			const removedItem = collection.remove( 'foo' );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 'foo' ) ).toBeNull();
			expect( collection.get( 1 ) ).toHaveProperty( 'id', 'bar' );
			expect( removedItem ).toHaveProperty( 'id', 'foo' );
		} );

		it( 'should remove the model by model', () => {
			const item = getItem( 'foo' );

			collection.add( getItem( 'bom' ) );
			collection.add( item );
			collection.add( getItem( 'bar' ) );

			expect( collection ).toHaveLength( 3 );

			const removedItem = collection.remove( item );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 'foo' ) ).toBeNull();
			expect( collection.get( 1 ) ).toHaveProperty( 'id', 'bar' );
			expect( removedItem ).toBe( item );
		} );

		it( 'should remove the model by model - custom id property', () => {
			const collection = new Collection( { idProperty: 'name' } );
			const item = getItem( 'foo', 'name' );

			collection.add( item );

			const removedItem = collection.remove( item );

			expect( collection ).toHaveLength( 0 );
			expect( collection.get( 'foo' ) ).toBeNull();
			expect( removedItem ).toHaveProperty( 'name', 'foo' );
		} );

		it( 'should fire the "remove" event', () => {
			const item1 = getItem( 'foo' );
			const item2 = getItem( 'bar' );
			const item3 = getItem( 'bom' );

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			const spy = vi.fn();

			collection.on( 'remove', spy );

			collection.remove( 1 ); // by index
			collection.remove( item1 ); // by model
			collection.remove( 'bom' ); // by id

			expect( spy ).toHaveBeenCalledTimes( 3 );
			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item1, 0 );
			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item2, 1 );
			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { source: collection } ), item3, 0 );
		} );

		it( 'should fire the "change" event', () => {
			const item = getItem( 'foo' );
			const spy = vi.fn();

			collection.add( item );
			collection.on( 'change', spy );

			collection.remove( item );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				added: [],
				removed: [ item ],
				index: 0
			} );
		} );

		it( 'should throw an error on invalid index', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( 1 );
			}, /^collection-remove-404/ );

			expect( collection ).toHaveLength( 1 );
		} );

		it( 'should throw an error on invalid id', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( 'bar' );
			}, /^collection-remove-404/ );

			expect( collection ).toHaveLength( 1 );
		} );

		it( 'should throw an error on invalid model', () => {
			collection.add( getItem( 'foo' ) );

			expectToThrowCKEditorError( () => {
				collection.remove( getItem( 'bar' ) );
			}, /^collection-remove-404/ );

			expect( collection ).toHaveLength( 1 );
		} );
	} );

	describe( 'map()', () => {
		it( 'uses native map', () => {
			const spy = vi.spyOn( Array.prototype, 'map' ).mockReturnValue( [ 'foo' ] );
			const ctx = {};

			const ret = collection.map( callback, ctx );

			// Collect the call data and restore the global stub before any assertion is made.
			const calls = spy.mock.calls.slice();

			spy.mockRestore();

			expect( calls ).toEqual( [ [ callback, ctx ] ] );
			expect( ret, 'ret value was forwarded' ).toEqual( [ 'foo' ] );

			function callback() {}
		} );
	} );

	describe( 'forEach()', () => {
		it( 'uses native forEach', () => {
			const spy = vi.spyOn( Array.prototype, 'forEach' ).mockReturnValue( undefined );
			const ctx = {};

			collection.forEach( callback, ctx );

			// Collect the call data and restore the global stub before any assertion is made.
			const calls = spy.mock.calls.slice();

			spy.mockRestore();

			expect( calls ).toEqual( [ [ callback, ctx ] ] );

			function callback() {}
		} );
	} );

	describe( 'find()', () => {
		it( 'uses native find', () => {
			const needl = getItem( 'foo' );

			const spy = vi.spyOn( Array.prototype, 'find' ).mockReturnValue( needl );
			const ctx = {};

			const ret = collection.find( callback, ctx );

			// Collect the call data and restore the global stub before any assertion is made.
			const calls = spy.mock.calls.slice();

			spy.mockRestore();

			expect( calls ).toEqual( [ [ callback, ctx ] ] );
			expect( ret, 'ret value was forwarded' ).toBe( needl );

			function callback() {}
		} );
	} );

	describe( 'filter()', () => {
		it( 'uses native filter', () => {
			const needl = getItem( 'foo' );

			// See: https://github.com/sinonjs/sinon/issues/1521
			const spy = vi.spyOn( collection._items, 'filter' ).mockReturnValue( [ needl ] );
			const ctx = {};

			const ret = collection.filter( callback, ctx );

			expect( spy ).toHaveBeenCalledWith( callback, ctx );
			expect( ret, 'ret value was forwarded' ).toEqual( [ needl ] );

			function callback() {}
		} );
	} );

	describe( 'clear()', () => {
		it( 'removes all items', () => {
			const items = [ {}, {}, {} ];
			const spy = vi.fn();

			collection.on( 'remove', spy );

			items.forEach( i => collection.add( i ) );

			collection.clear();

			expect( spy ).toHaveBeenCalledTimes( 3 );
			expect( collection.length ).toBe( 0 );
		} );

		it( 'breaks the binding', () => {
			const external = new Collection();
			collection.bindTo( external ).using( i => i );

			external.add( { foo: 'bar' } );
			expect( collection ).toHaveLength( 1 );

			collection.clear();

			external.add( { foo: 'baz' } );
			expect( collection ).toHaveLength( 0 );

			external.remove( 0 );
			expect( collection ).toHaveLength( 0 );

			expect( collection._bindToCollection ).toBeNull();
		} );

		it( 'should fire the "change" event', () => {
			const items = [ {}, {}, {} ];
			const spy = vi.fn();

			collection.addMany( items );
			collection.on( 'change', spy );

			collection.clear();

			expect( spy ).toHaveBeenCalledTimes( 1 );

			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				added: [],
				removed: items,
				index: 0
			} );
		} );
	} );

	describe( 'bindTo()', () => {
		class FactoryClass {
			constructor( data ) {
				this.data = data;
			}
		}

		function assertItems( collection, expectedItems ) {
			expect( collection.map( i => i.v ) ).toEqual( expectedItems );
		}

		it( 'throws when binding more than once', () => {
			collection.bindTo( {} );

			expectToThrowCKEditorError( () => {
				collection.bindTo( {} );
			}, /^collection-bind-to-rebind/ );
		} );

		it( 'provides "using()" and "as()" interfaces', () => {
			const returned = collection.bindTo( {} );

			expect( Object.keys( returned ).sort() ).toEqual( [ 'as', 'using' ] );
			expect( returned.using ).toBeTypeOf( 'function' );
			expect( returned.as ).toBeTypeOf( 'function' );
		} );

		it( 'stores reference to bound collection', () => {
			const collectionB = new Collection();

			expect( collection._bindToCollection ).toBeUndefined();
			expect( collectionB._bindToCollection ).toBeUndefined();

			collection.bindTo( collectionB ).as( FactoryClass );

			expect( collection._bindToCollection ).toBe( collectionB );
			expect( collectionB._bindToCollection ).toBeUndefined();
		} );

		describe( 'as()', () => {
			let items;

			beforeEach( () => {
				items = new Collection();
			} );

			it( 'does not chain', () => {
				const returned = collection.bindTo( new Collection() ).as( FactoryClass );

				expect( returned ).toBeUndefined();
			} );

			it( 'creates a binding (initial content)', () => {
				items.add( { id: '1' } );
				items.add( { id: '2' } );

				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).toHaveLength( 2 );
				expect( collection.get( 0 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).toBe( items.get( 1 ) );
			} );

			it( 'creates a binding (new content)', () => {
				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).toHaveLength( 0 );

				items.add( { id: '1' } );
				items.add( { id: '2' } );

				expect( collection ).toHaveLength( 2 );
				expect( collection.get( 0 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).toBe( items.get( 1 ) );
			} );

			it( 'creates a binding (item removal)', () => {
				collection.bindTo( items ).as( FactoryClass );

				expect( collection ).toHaveLength( 0 );

				items.add( { id: '1' } );
				items.add( { id: '2' } );

				expect( collection ).toHaveLength( 2 );
				expect( collection.get( 0 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ) ).toBeInstanceOf( FactoryClass );
				expect( collection.get( 1 ).data ).toBe( items.get( 1 ) );

				items.remove( 1 );
				expect( collection.get( 0 ).data ).toBe( items.get( 0 ) );

				items.remove( 0 );
				expect( collection ).toHaveLength( 0 );
			} );
		} );

		describe( 'using()', () => {
			let items;

			beforeEach( () => {
				items = new Collection();
			} );

			it( 'does not chain', () => {
				const returned = collection.bindTo( new Collection() ).using( () => {} );

				expect( returned ).toBeUndefined();
			} );

			describe( 'callback', () => {
				it( 'creates a binding (arrow function)', () => {
					collection.bindTo( items ).using( item => {
						return new FactoryClass( item );
					} );

					expect( collection ).toHaveLength( 0 );

					items.add( { id: '1' } );
					items.add( { id: '2' } );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ) ).toBeInstanceOf( FactoryClass );
					expect( collection.get( 1 ) ).toBeInstanceOf( FactoryClass );
					expect( collection.get( 1 ).data ).toBe( items.get( 1 ) );
				} );

				// https://github.com/ckeditor/ckeditor5-ui/issues/113
				it( 'creates a binding (normal function)', () => {
					collection.bindTo( items ).using( function( item ) {
						return new FactoryClass( item );
					} );

					items.add( { id: '1' } );

					expect( collection ).toHaveLength( 1 );

					const view = collection.get( 0 );

					// Wrong args will be passed to the callback if it's treated as the view constructor.
					expect( view ).toBeInstanceOf( FactoryClass );
					expect( view.data ).toBe( items.get( 0 ) );
				} );

				it( 'creates a 1:1 binding', () => {
					collection.bindTo( items ).using( item => item );

					expect( collection ).toHaveLength( 0 );

					const item1 = { id: '100' };
					const item2 = { id: '200' };

					items.add( item1 );
					items.add( item2 );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ) ).toBe( item1 );
					expect( collection.get( 1 ) ).toBe( item2 );
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

					expect( collection ).toHaveLength( 0 );

					const item1 = { id: 'FactoryClass' };
					const item2 = { id: 'CustomClass' };

					items.add( item1 );
					items.add( item2 );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ) ).toBeInstanceOf( FactoryClass );
					expect( collection.get( 1 ) ).toBeInstanceOf( CustomClass );
				} );

				it( 'creates a binding to a property name', () => {
					collection.bindTo( items ).using( item => item.prop );

					expect( collection ).toHaveLength( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ).value ).toBe( 'foo' );
					expect( collection.get( 1 ).value ).toBe( 'bar' );
				} );

				it( 'skips when there is no item', () => {
					// Add before collection is bound.
					items.add( { value: 1, skip: true } );

					expect( collection ).toHaveLength( 0 );

					collection.bindTo( items ).using( item => {
						if ( item.skip ) {
							return null;
						}

						return item;
					} );

					// Still 0 because initial item was skipped.
					expect( collection ).toHaveLength( 0 );

					items.add( { value: 2, skip: false } );
					items.add( { value: 3, skip: true } );
					items.add( { value: 4, skip: false } );

					expect( Array.from( collection, item => item.value ) ).toEqual( [ 2, 4 ] );

					items.add( { value: 5, skip: false }, 2 );

					expect( Array.from( collection, item => item.value ) ).toEqual( [ 2, 5, 4 ] );
				} );
			} );

			describe( 'property name', () => {
				it( 'creates a binding', () => {
					collection.bindTo( items ).using( 'prop' );

					expect( collection ).toHaveLength( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ).value ).toBe( 'foo' );
					expect( collection.get( 1 ).value ).toBe( 'bar' );
				} );

				it( 'creates a binding (item removal)', () => {
					collection.bindTo( items ).using( 'prop' );

					expect( collection ).toHaveLength( 0 );

					items.add( { prop: { value: 'foo' } } );
					items.add( { prop: { value: 'bar' } } );

					expect( collection ).toHaveLength( 2 );
					expect( collection.get( 0 ).value ).toBe( 'foo' );
					expect( collection.get( 1 ).value ).toBe( 'bar' );

					items.remove( 1 );
					expect( collection ).toHaveLength( 1 );
					expect( collection.get( 0 ).value ).toBe( 'foo' );

					items.remove( 0 );
					expect( collection ).toHaveLength( 0 );
				} );

				it( 'skips when there is no item', () => {
					items.add( { prop: null } );

					collection.bindTo( items ).using( 'prop' );

					// Still 0 because initial item was skipped.
					expect( collection ).toHaveLength( 0 );

					items.add( { prop: { value: 2, skip: false } } );
					items.add( { prop: null } );
					items.add( { prop: { value: 4, skip: false } } );

					expect( Array.from( collection, item => item.value ) ).toEqual( [ 2, 4 ] );

					items.add( { prop: { value: 5 } }, 2 );

					expect( Array.from( collection, item => item.value ) ).toEqual( [ 2, 5, 4 ] );
				} );
			} );
		} );

		describe( 'two–way data binding', () => {
			it( 'works with custom factories (1)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = vi.fn();
				const spyB = vi.fn();

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

				expect( spyA ).toHaveBeenCalledTimes( 3 );
				expect( spyB ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'works with custom factories (2)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = vi.fn();
				const spyB = vi.fn();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				// A<--->B
				collectionA.bindTo( collectionB ).using( 'data' );
				collectionB.bindTo( collectionA ).using( i => new FactoryClass( i ) );

				collectionA.add( { v: 4 } );
				collectionA.add( { v: 6 } );

				expect( [ ...collectionB ].every( i => i instanceof FactoryClass ) ).toBe( true );
				expect( [ ...collectionB ].map( i => i.data ) ).toEqual( [ ...collectionA ] );
				expect( collectionB.map( i => i.data.v ) ).toEqual( [ 4, 6 ] );
				expect( collectionA.map( i => i.v ) ).toEqual( [ 4, 6 ] );

				collectionB.add( new FactoryClass( { v: 8 } ) );

				expect( [ ...collectionB ].every( i => i instanceof FactoryClass ) ).toBe( true );
				expect( [ ...collectionB ].map( i => i.data ) ).toEqual( [ ...collectionA ] );
				expect( collectionB.map( i => i.data.v ) ).toEqual( [ 4, 6, 8 ] );
				expect( collectionA.map( i => i.v ) ).toEqual( [ 4, 6, 8 ] );
			} );

			it( 'works with custom factories (custom index)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = vi.fn();
				const spyB = vi.fn();

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

				expect( spyA ).toHaveBeenCalledTimes( 3 );
				expect( spyB ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'works with 1:1 binding', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyA = vi.fn();
				const spyB = vi.fn();

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

				expect( [ ...collectionA ] ).toEqual( [ ...collectionB ] );

				expect( spyA ).toHaveBeenCalledTimes( 3 );
				expect( spyB ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'works with double chaining', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();
				const collectionC = new Collection();

				const spyA = vi.fn();
				const spyB = vi.fn();
				const spyC = vi.fn();

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

				expect( spyA ).toHaveBeenCalledTimes( 3 );
				expect( spyB ).toHaveBeenCalledTimes( 3 );
				expect( spyC ).toHaveBeenCalledTimes( 4 );
			} );

			it( 'removes items correctly', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				const spyAddA = vi.fn();
				const spyAddB = vi.fn();
				const spyRemoveA = vi.fn();
				const spyRemoveB = vi.fn();

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

				expect( spyAddA ).toHaveBeenCalledTimes( 3 );
				expect( spyAddB ).toHaveBeenCalledTimes( 3 );
				expect( spyRemoveA ).toHaveBeenCalledTimes( 1 );
				expect( spyRemoveB ).toHaveBeenCalledTimes( 1 );

				collectionA.remove( 1 );

				assertItems( collectionA, [ 6 ] );
				assertItems( collectionB, [ 3 ] );

				expect( spyAddA ).toHaveBeenCalledTimes( 3 );
				expect( spyAddB ).toHaveBeenCalledTimes( 3 );
				expect( spyRemoveA ).toHaveBeenCalledTimes( 2 );
				expect( spyRemoveB ).toHaveBeenCalledTimes( 2 );
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

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D' ] );
					assertItems( collectionB, [ 'A', 'D' ] );

					collectionB.add( { v: 'E' } );
					collectionB.add( { v: 'F', skip: true } );
					collectionB.add( { v: 'G' } );

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 3 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
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

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 3, 4 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionA.add( { v: 'I' }, 2 );

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 4, 5 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'I', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'I', 'D', 'E', 'F', 'G', 'H' ] );

					collectionB.add( { v: 'J' }, 5 );

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 4, 5 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
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

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 3, 4 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1, 2 ] );
					assertItems( collectionA, [ 'A', 'B', 'C', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionA.remove( 2 );

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 3, 4 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1 ] );
					assertItems( collectionA, [ 'A', 'B', 'D', 'E', 'H' ] );
					assertItems( collectionB, [ 'A', 'D', 'E', 'F', 'G', 'H' ] );

					collectionB.remove( 3 );

					expect( [ ...collectionA._skippedIndexesFromExternal ].sort() ).toEqual( [ 3 ] );
					expect( [ ...collectionB._skippedIndexesFromExternal ].sort() ).toEqual( [ 1 ] );
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

			expect( items ).toEqual( [ 'foo', 'bar', 'bom' ] );
		} );
	} );
} );
