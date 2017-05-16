/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import mix from '../src/mix';

describe( 'utils', () => {
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
			mix( Foo, MixinA, MixinB );

			expect( Foo ).to.not.have.property( 'a' );
			expect( Foo ).to.not.have.property( 'b' );

			const foo = new Foo();

			expect( foo.a() ).to.equal( 'a' );
			expect( foo.b() ).to.equal( 'b' );
		} );

		it( 'does not break the instanceof operator', () => {
			class Foo {}
			mix( Foo, MixinA );

			const foo = new Foo();

			expect( foo ).to.be.instanceof( Foo );
		} );

		it( 'defines properties with the same descriptors as native classes', () => {
			class Foo {
				foo() {}
			}

			mix( Foo, MixinA );

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

			mix( Foo, Mixin );

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

			mix( Foo, Mixin );

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
			mix( Foo, MixinA, MixinB );

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

			mix( Bar, MixinA, MixinB );

			const bar = new Bar();

			expect( bar.a() ).to.equal( 'foo' );
			expect( bar.b() ).to.equal( 'b' );
		} );
	} );
} );
