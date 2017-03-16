/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Collection from '../src/collection';
import CKEditorError from '../src/ckeditorerror';

testUtils.createSinonSandbox();

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
		it( 'allows to change the id property used by the collection', () => {
			let item1 = { id: 'foo', name: 'xx' };
			let item2 = { id: 'foo', name: 'yy' };
			let collection = new Collection( { idProperty: 'name' } );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection ).to.have.length( 2 );

			expect( collection.get( 'xx' ) ).to.equal( item1 );
			expect( collection.remove( 'yy' ) ).to.equal( item2 );
		} );
	} );

	describe( 'add()', () => {
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
			let item1 = {};
			let item2 = {};

			collection.add( item1 );
			expect( collection.get( 0 ) ).to.equal( item1 );

			collection.add( item2 );
			expect( collection.get( 0 ) ).to.equal( item1 );
			expect( collection.get( 1 ) ).to.equal( item2 );
		} );

		it( 'should enable get( id )', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'bar' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should enable get( id ) - custom id property', () => {
			let collection = new Collection( { idProperty: 'name' } );
			let item1 = getItem( 'foo', 'name' );
			let item2 = getItem( 'bar', 'name' );

			collection.add( item1 );
			collection.add( item2 );

			expect( collection.get( 'foo' ) ).to.equal( item1 );
			expect( collection.get( 'bar' ) ).to.equal( item2 );
		} );

		it( 'should generate an id when not defined', () => {
			let item = {};

			collection.add( item );

			expect( item.id ).to.be.a( 'string' );
			expect( collection.get( item.id ) ).to.equal( item );
		} );

		it( 'should generate an id when not defined - custom id property', () => {
			let collection = new Collection( { idProperty: 'name' } );
			let item = {};

			collection.add( item );

			expect( item.name ).to.be.a( 'string' );
			expect( collection.get( item.name ) ).to.equal( item );
		} );

		it( 'should not change an existing id of an item', () => {
			let item = getItem( 'foo' );

			collection.add( item );

			expect( item.id ).to.equal( 'foo' );
		} );

		it( 'should throw when item with this id already exists', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'foo' );

			collection.add( item1 );

			expect( () => {
				collection.add( item2 );
			} ).to.throw( CKEditorError, /^collection-add-item-already-exists/ );
		} );

		it( 'should throw when item\'s id is not a string', () => {
			let item = { id: 1 };

			expect( () => {
				collection.add( item );
			} ).to.throw( CKEditorError, /^collection-add-invalid-id/ );
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

				collectionA.add( itemA );
				collectionB.add( itemB );
				collectionB.add( collectionA.remove( itemA ) );

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

			collectionA.add( item );
			collectionB.add( item );

			expect( collectionA.length ).to.equal( 1 );
			expect( collectionB.length ).to.equal( 1 );
			expect( collectionA.get( item.id ) ).to.equal( collectionB.get( 0 ) );
		} );

		it( 'should fire the "add" event', () => {
			let spy = sinon.spy();
			let item = {};

			collection.on( 'add', spy );

			collection.add( item );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item, 0 );
		} );

		it( 'should support an optional index argument', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'bar' );
			let item3 = getItem( 'baz' );
			let item4 = getItem( 'abc' );

			collection.add( item1 );
			collection.add( item2, 0 );
			collection.add( item3, 1 );
			collection.add( item4, 3 );

			expect( collection.get( 0 ) ).to.equal( item2 );
			expect( collection.get( 1 ) ).to.equal( item3 );
			expect( collection.get( 2 ) ).to.equal( item1 );
			expect( collection.get( 3 ) ).to.equal( item4 );
		} );

		it( 'should throw when index argument is invalid', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'bar' );
			let item3 = getItem( 'baz' );

			collection.add( item1 );

			expect( () => {
				collection.add( item2, -1 );
			} ).to.throw( /^collection-add-item-invalid-index/ );

			expect( () => {
				collection.add( item2, 2 );
			} ).to.throw( /^collection-add-item-invalid-index/ );

			collection.add( item2, 1 );
			collection.add( item3, 0 );

			expect( collection.length ).to.be.equal( 3 );
		} );

		it( 'should fire the "add" event with the index argument', () => {
			let spy = sinon.spy();

			collection.add( {} );
			collection.add( {} );

			collection.on( 'add', spy );

			const item = {};
			collection.add( item, 1 );

			sinon.assert.calledWithExactly( spy, sinon.match.has( 'source', collection ), item, 1 );
		} );
	} );

	describe( 'get()', () => {
		it( 'should return an item', () => {
			let item = getItem( 'foo' );
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

			let removedItem = collection.remove( 1 );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by index - custom id property', () => {
			let collection = new Collection( { idProperty: 'name' } );

			collection.add( getItem( 'foo', 'name' ) );

			let removedItem = collection.remove( 0 );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should remove the model by id', () => {
			collection.add( getItem( 'bom' ) );
			collection.add( getItem( 'foo' ) );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			let removedItem = collection.remove( 'foo' );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.have.property( 'id', 'foo' );
		} );

		it( 'should remove the model by model', () => {
			let item = getItem( 'foo' );

			collection.add( getItem( 'bom' ) );
			collection.add( item );
			collection.add( getItem( 'bar' ) );

			expect( collection ).to.have.length( 3 );

			let removedItem = collection.remove( item );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( collection.get( 1 ) ).to.have.property( 'id', 'bar' );
			expect( removedItem ).to.equal( item );
		} );

		it( 'should remove the model by model - custom id property', () => {
			let collection = new Collection( null, 'name' );
			let item = getItem( 'foo', 'name' );

			collection.add( item );

			let removedItem = collection.remove( item );

			expect( collection ).to.have.length( 0 );
			expect( collection.get( 'foo' ) ).to.be.null;
			expect( removedItem ).to.have.property( 'name', 'foo' );
		} );

		it( 'should fire the "remove" event', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'bar' );
			let item3 = getItem( 'bom' );

			collection.add( item1 );
			collection.add( item2 );
			collection.add( item3 );

			let spy = sinon.spy();

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

	describe( 'map()', () => {
		it( 'uses native map', () => {
			let spy = testUtils.sinon.stub( Array.prototype, 'map', () => {
				return [ 'foo' ];
			} );
			let ctx = {};

			let ret = collection.map( callback, ctx );

			sinon.assert.calledWithExactly( spy, callback, ctx );
			expect( ret ).to.deep.equal( [ 'foo' ], 'ret value was forwarded' );

			function callback() {}
		} );
	} );

	describe( 'find()', () => {
		it( 'uses native find', () => {
			let needl = getItem( 'foo' );

			let spy = testUtils.sinon.stub( Array.prototype, 'find', () => {
				return needl;
			} );
			let ctx = {};

			let ret = collection.find( callback, ctx );

			sinon.assert.calledWithExactly( spy, callback, ctx );
			expect( ret ).to.equal( needl, 'ret value was forwarded' );

			function callback() {}
		} );
	} );

	describe( 'filter()', () => {
		it( 'uses native filter', () => {
			let needl = getItem( 'foo' );

			let spy = testUtils.sinon.stub( Array.prototype, 'filter', () => {
				return [ needl ];
			} );
			let ctx = {};

			let ret = collection.filter( callback, ctx );

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
	} );

	describe( 'bindTo()', () => {
		class FactoryClass {
			constructor( data ) {
				this.data = data;
			}
		}

		it( 'provides "using()" and "as()" interfaces', () => {
			const returned = collection.bindTo( {} );

			expect( returned ).to.have.keys( 'using', 'as' );
			expect( returned.using ).to.be.a( 'function' );
			expect( returned.as ).to.be.a( 'function' );
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
					collection.bindTo( items ).using( ( item ) => {
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
			} );
		} );

		describe( 'two–way data binding', () => {
			it( 'works (custom factories)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				collectionA.name = 'A';
				collectionB.name = 'B';

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				collectionA.bindTo( collectionB ).using( 'data' );
				collectionB.bindTo( collectionA ).as( FactoryClass );

				collectionA.add( { value: 'foo' } );
				collectionA.add( { value: 'bar' } );

				expect( collectionA.map( i => i.value ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data.value ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionB' );

				collectionB.add( new FactoryClass( { value: 'baz' } ) );

				expect( collectionA.map( i => i.value ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data.value ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionB' );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
			} );

			it( 'works (1:1)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();

				collectionA.name = 'A';
				collectionB.name = 'B';

				const spyA = sinon.spy();
				const spyB = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );

				collectionA.bindTo( collectionB ).using( i => i );
				collectionB.bindTo( collectionA ).using( i => i );

				collectionA.add( new FactoryClass( 'foo' ) );
				collectionA.add( new FactoryClass( 'bar' ) );

				expect( collectionA.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionB' );

				collectionB.add( new FactoryClass( 'baz' ) );

				expect( collectionA.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionB' );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
			} );

			it( 'works (double chain)', () => {
				const collectionA = new Collection();
				const collectionB = new Collection();
				const collectionC = new Collection();

				collectionA.name = 'A';
				collectionB.name = 'B';
				collectionC.name = 'C';

				const spyA = sinon.spy();
				const spyB = sinon.spy();
				const spyC = sinon.spy();

				collectionA.on( 'add', spyA );
				collectionB.on( 'add', spyB );
				collectionC.on( 'add', spyC );

				// A<--->B--->C
				collectionA.bindTo( collectionB ).using( i => i );
				collectionB.bindTo( collectionA ).using( i => i );
				collectionC.bindTo( collectionB ).using( i => i );

				collectionA.add( new FactoryClass( 'foo' ) );
				collectionA.add( new FactoryClass( 'bar' ) );

				expect( collectionA.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionB' );
				expect( collectionC.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar' ], 'CollectionC' );

				collectionB.add( new FactoryClass( 'baz' ) );

				expect( collectionA.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionB' );
				expect( collectionC.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionC' );

				collectionC.add( new FactoryClass( 'qux' ) );

				expect( collectionA.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionA' );
				expect( collectionB.map( i => i ).every( i => i instanceof FactoryClass ) ).to.be.true;
				expect( collectionB.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ], 'CollectionB' );
				expect( collectionC.map( i => i.data ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'qux' ], 'CollectionC' );

				sinon.assert.callCount( spyA, 3 );
				sinon.assert.callCount( spyB, 3 );
				sinon.assert.callCount( spyC, 4 );
			} );
		} );
	} );

	describe( 'iterator', () => {
		it( 'covers the whole collection', () => {
			let item1 = getItem( 'foo' );
			let item2 = getItem( 'bar' );
			let item3 = getItem( 'bom' );
			let items = [];

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
