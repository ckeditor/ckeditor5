/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '/ckeditor5/core/utils.js';

describe( 'utils', () => {
	describe( 'spy', () => {
		it( 'should not have `called` after creation', () => {
			let spy = utils.spy();

			expect( spy.called ).to.not.be.true();
		} );

		it( 'should register calls', () => {
			let fn1 = utils.spy();
			let fn2 = utils.spy();

			fn1();

			expect( fn1.called ).to.be.true();
			expect( fn2.called ).to.not.be.true();
		} );
	} );

	describe( 'uid', () => {
		it( 'should return different ids', () => {
			let id1 = utils.uid();
			let id2 = utils.uid();
			let id3 = utils.uid();

			expect( id1 ).to.be.a( 'number' );
			expect( id2 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id3 );
			expect( id3 ).to.be.a( 'number' ).to.not.equal( id1 ).to.not.equal( id2 );
		} );
	} );

	describe( 'isIterable', () => {
		it( 'should be true for string', () => {
			let string = 'foo';

			expect( utils.isIterable( string ) ).to.be.true;
		} );

		it( 'should be true for arrays', () => {
			let array = [ 1, 2, 3 ];

			expect( utils.isIterable( array ) ).to.be.true;
		} );

		it( 'should be true for iterable classes', () => {
			class IterableClass {
				constructor() {
					this.array = [ 1, 2, 3 ];
				}

				[ Symbol.iterator ]() {
					return this.array[ Symbol.iterator ]();
				}
			}

			let instance = new IterableClass();

			expect( utils.isIterable( instance ) ).to.be.true;
		} );

		it( 'should be false for not iterable objects', () => {
			let notIterable = { foo: 'bar' };

			expect( utils.isIterable( notIterable ) ).to.be.false;
		} );

		it( 'should be false for undefined', () => {
			expect( utils.isIterable() ).to.be.false;
		} );
	} );

	describe( 'compareArrays', () => {
		it( 'should return SAME flag, when arrays are same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( 'SAME' );
		} );

		it( 'should return PREFIX flag, when all n elements of first array are same as n first elements of the second array', () => {
			let a = [ 'abc', 0 ];
			let b = [ 'abc', 0, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( 'PREFIX' );
		} );

		it( 'should return EXTENSION flag, when n first elements of first array are same as all elements of the second array', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( 'EXTENSION' );
		} );

		it( 'should return index on which arrays differ, when arrays are not the same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 1, 3 ];

			let result = utils.compareArrays( a, b );

			expect( result ).to.equal( 1 );
		} );
	} );

	describe( 'mapsEqual', () => {
		it( 'should return true if maps have exactly same entries (order of adding does not matter)', () => {
			let mapA = new Map();
			let mapB = new Map();

			mapA.set( 'foo', 'bar' );
			mapA.set( 'abc', 'xyz' );

			mapB.set( 'abc', 'xyz' );
			mapB.set( 'foo', 'bar' );

			expect( utils.mapsEqual( mapA, mapB ) ).to.be.true;
		} );
	} );

	describe( 'nth', () => {
		it( 'should return 0th item', () => {
			expect( utils.nth( 0, getIterator() ) ).to.equal( 11 );
		} );

		it( 'should return the last item', () => {
			expect( utils.nth( 2, getIterator() ) ).to.equal( 33 );
		} );

		it( 'should return null if out of range (bottom)', () => {
			expect( utils.nth( -1, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if out of range (top)', () => {
			expect( utils.nth( 3, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if iterator is empty', () => {
			expect( utils.nth( 0, [] ) ).to.be.null;
		} );

		function *getIterator() {
			yield 11;
			yield 22;
			yield 33;
		}
	} );

	describe( 'mix', () => {
		const MixinA = {
			a() {
				return 'a';
			}
		};
		const MixinB = {
			b() {
				return 'b';
			}
		};

		it( 'mixes 2nd+ argument\'s properties into the first class', () => {
			class Foo {}
			utils.mix( Foo, MixinA, MixinB );

			expect( Foo ).to.not.have.property( 'a' );
			expect( Foo ).to.not.have.property( 'b' );

			const foo = new Foo();

			expect( foo.a() ).to.equal( 'a' );
			expect( foo.b() ).to.equal( 'b' );
		} );

		it( 'does not break the instanceof operator', () => {
			class Foo {}
			utils.mix( Foo, MixinA );

			let foo = new Foo();

			expect( foo ).to.be.instanceof( Foo );
		} );

		it( 'defines properties with the same descriptors as native classes', () => {
			class Foo {
				foo() {}
			}

			utils.mix( Foo, MixinA );

			const actualDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, 'a' );
			const expectedDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, 'foo' );

			expect( actualDescriptor ).to.have.property( 'writable', expectedDescriptor.writable );
			expect( actualDescriptor ).to.have.property( 'enumerable', expectedDescriptor.enumerable );
			expect( actualDescriptor ).to.have.property( 'configurable', expectedDescriptor.configurable );
		} );

		it( 'copies setters and getters (with descriptors as of native classes)', () => {
			class Foo {
				set foo( v ) {
					this._foo = v;
				}
				get foo() {}
			}

			const Mixin = {
				set a( v ) {
					this._a = v;
				},
				get a() {
					return this._a;
				}
			};

			utils.mix( Foo, Mixin );

			const actualDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, 'a' );
			const expectedDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, 'foo' );

			expect( actualDescriptor ).to.have.property( 'enumerable', expectedDescriptor.enumerable );
			expect( actualDescriptor ).to.have.property( 'configurable', expectedDescriptor.configurable );

			const foo = new Foo();

			foo.a = 1;
			expect( foo._a ).to.equal( 1 );

			foo._a = 2;
			expect( foo.a ).to.equal( 2 );
		} );

		it( 'copies symbols (with descriptors as of native classes)', () => {
			const symbolA = Symbol( 'a' );
			const symbolFoo = Symbol( 'foo' );

			// https://github.com/jscs-dev/node-jscs/issues/2078
			// jscs:disable disallowSpacesInFunction
			class Foo {
				[ symbolFoo ]() {
					return 'foo';
				}
			}

			const Mixin = {
				[ symbolA ]() {
					return 'a';
				}
			};
			// jscs:enable disallowSpacesInFunction

			utils.mix( Foo, Mixin );

			const actualDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, symbolA );
			const expectedDescriptor = Object.getOwnPropertyDescriptor( Foo.prototype, symbolFoo );

			expect( actualDescriptor ).to.have.property( 'writable', expectedDescriptor.writable );
			expect( actualDescriptor ).to.have.property( 'enumerable', expectedDescriptor.enumerable );
			expect( actualDescriptor ).to.have.property( 'configurable', expectedDescriptor.configurable );

			const foo = new Foo();

			expect( foo[ symbolA ]() ).to.equal( 'a' );
		} );

		it( 'does not copy already existing properties', () => {
			class Foo {
				a() {
					return 'foo';
				}
			}
			utils.mix( Foo, MixinA, MixinB );

			const foo = new Foo();

			expect( foo.a() ).to.equal( 'foo' );
			expect( foo.b() ).to.equal( 'b' );
		} );

		it( 'does not copy already existing properties - properties deep in the proto chain', () => {
			class Foo {
				a() {
					return 'foo';
				}
			}
			class Bar extends Foo {}

			utils.mix( Bar, MixinA, MixinB );

			const bar = new Bar();

			expect( bar.a() ).to.equal( 'foo' );
			expect( bar.b() ).to.equal( 'b' );
		} );
	} );
} );
