/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Config from '../src/config';

describe( 'Config', () => {
	let config;

	beforeEach( () => {
		config = new Config( {
			creator: 'inline',
			language: 'pl',
			resize: {
				minHeight: 300,
				maxHeight: 800,
				icon: {
					path: 'xyz'
				}
			},
			toolbar: 'top'
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should set configurations', () => {
			expect( config.get( 'creator' ) ).to.equal( 'inline' );
			expect( config.get( 'language' ) ).to.equal( 'pl' );
			expect( config.get( 'resize' ) ).to.deep.equal( {
				minHeight: 300,
				maxHeight: 800,
				icon: {
					path: 'xyz'
				}
			} );
			expect( config.get( 'toolbar' ) ).to.equal( 'top' );
		} );

		it( 'should work with no parameters', () => {
			// No error should be thrown.
			config = new Config();
		} );

		it( 'should set default parameters', () => {
			const defaultConfig = {
				foo: 1,
				bar: 2,
			};

			config = new Config( {}, defaultConfig );

			expect( config.get( 'foo' ) ).to.equal( 1 );
			expect( config.get( 'bar' ) ).to.equal( 2 );
		} );

		it( 'passed parameters should override default parameters', () => {
			const defaultConfig = {
				foo: 1,
				bar: 2,
			};

			config = new Config( {
				foo: 10,
			}, defaultConfig );

			expect( config.get( 'foo' ) ).to.equal( 10 );
			expect( config.get( 'bar' ) ).to.equal( 2 );
		} );

		it( 'should work with deeper objects', () => {
			const defaultConfig = {
				a: {
					first: 1,
					second: 2
				},
				b: {
					foo: {
						first: 1,
						second: 2,
					}
				}
			};

			const parameters = {
				a: {
					third: 3
				},
				b: {
					foo: {
						first: 3,
						third: 1
					}
				},
				custom: 'foo'
			};

			config = new Config( parameters, defaultConfig );

			expect( config.get( 'a' ) ).to.deep.equal( {
				first: 1,
				second: 2,
				third: 3
			} );

			expect( config.get( 'b' ) ).to.have.key( 'foo' );

			expect( config.get( 'b.foo' ) ).to.deep.equal( {
				first: 3,
				second: 2,
				third: 1
			} );

			expect( config.get( 'custom' ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'set()', () => {
		it( 'should set configurations when passing objects', () => {
			config.set( {
				option1: 1,
				option2: {
					subOption21: 21
				}
			} );

			expect( config.get( 'option1' ) ).to.equal( 1 );
			expect( config.get( 'option2.subOption21' ) ).to.equal( 21 );
		} );

		it( 'should set configurations when passing name and value', () => {
			config.set( 'something', 'anything' );

			expect( config.get( 'something' ) ).to.equal( 'anything' );
		} );

		it( 'should set configurations when passing name.with.deep and value', () => {
			config.set( 'color.red', 'f00' );
			config.set( 'background.color.blue', '00f' );

			expect( config.get( 'color.red' ) ).to.equal( 'f00' );
			expect( config.get( 'background.color.blue' ) ).to.equal( '00f' );
		} );

		it( 'should replace a simple entry with an object', () => {
			config.set( 'test', 1 );
			config.set( 'test', {
				prop: 1
			} );

			expect( config.get( 'test' ) ).to.be.an( 'object' );
			expect( config.get( 'test.prop' ) ).to.equal( 1 );
		} );

		it( 'should replace a simple entry with an object when passing only object', () => {
			config.set( 'test', 1 );
			config.set( {
				test: {
					prop: 1
				}
			} );

			expect( config.get( 'test' ) ).to.be.an( 'object' );
			expect( config.get( 'test.prop' ) ).to.equal( 1 );
		} );

		it( 'should replace a simple entry with an object when passing a name.with.deep', () => {
			config.set( 'test.prop', 1 );
			config.set( 'test.prop.value', 1 );

			expect( config.get( 'test' ) ).to.be.an( 'object' );
			expect( config.get( 'test.prop' ) ).to.be.an( 'object' );
			expect( config.get( 'test.prop.value' ) ).to.equal( 1 );
		} );

		it( 'should override and expand deep configurations', () => {
			config.set( {
				resize: {
					minHeight: 400,		// Override
					hidden: true,		// Expand
					icon: {
						path: 'abc',	// Override
						url: true		// Expand
					}
				}
			} );

			expect( config.get( 'resize' ) ).to.be.deep.equal( {
				minHeight: 400,		// Overridden
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'abc',	// Overridden
					url: true		// Expanded
				}
			} );
		} );

		it( 'should override and expand object when passing an object', () => {
			config.set( 'resize', {
				minHeight: 400,		// Override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// Override
					url: true		// Expand
				}
			} );

			expect( config.get( 'resize' ) ).to.deep.equal( {
				minHeight: 400,		// Overridden
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'abc',	// Overridden
					url: true		// Expanded
				}
			} );
		} );

		it( 'should not create object for non-pure objects', () => {
			function SomeClass() {}

			config.set( 'date', new Date() );
			config.set( {
				instance: new SomeClass()
			} );

			expect( config.get( 'date' ) ).to.be.an.instanceof( Date );
			expect( config.get( 'instance' ) ).to.be.an.instanceof( SomeClass );
		} );
	} );

	describe( 'define()', () => {
		it( 'should set configurations when passing objects', () => {
			config.set( {
				option1: 1,
				option2: {
					subOption21: 21
				}
			} );

			expect( config.get( 'option1' ) ).to.equal( 1 );
			expect( config.get( 'option2.subOption21' ) ).to.equal( 21 );
		} );

		it( 'should set configurations when passing name and value', () => {
			config.set( 'something', 'anything' );

			expect( config.get( 'something' ) ).to.equal( 'anything' );
		} );

		it( 'should set configurations when passing name.with.deep and value', () => {
			config.set( 'color.red', 'f00' );
			config.set( 'background.color.blue', '00f' );

			expect( config.get( 'color.red' ) ).to.equal( 'f00' );
			expect( config.get( 'background.color.blue' ) ).to.equal( '00f' );
		} );

		it( 'should not replace already defined values', () => {
			config.define( 'language', 'en' );
			config.define( 'resize.minHeight', 400 );
			config.define( 'resize.icon', 'some value' );

			expect( config.get( 'language' ) ).to.equal( 'pl' );
			expect( config.get( 'resize.icon' ) ).to.be.an( 'object' );
			expect( config.get( 'resize.minHeight' ) ).to.equal( 300 );
		} );

		it( 'should expand but not override deep configurations', () => {
			config.define( {
				resize: {
					minHeight: 400,		// No override
					hidden: true,		// Expand
					icon: {
						path: 'abc',	// No override
						url: true		// Expand
					}
				}
			} );

			expect( config.get( 'resize' ) ).to.be.deep.equal( {
				minHeight: 300,		// The same
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'xyz',	// The same
					url: true		// Expanded
				}
			} );
		} );

		it( 'should expand but not override when passing an object', () => {
			config.define( 'resize', {
				minHeight: 400,		// No override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// No override
					url: true		// Expand
				}
			} );

			expect( config.get( 'resize' ) ).to.be.deep.equal( {
				minHeight: 300,		// The same
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'xyz',	// The same
					url: true		// Expanded
				}
			} );
		} );

		it( 'should not create an object for non-pure objects', () => {
			function SomeClass() {}

			config.define( 'date', new Date() );
			config.define( {
				instance: new SomeClass()
			} );

			expect( config.get( 'date' ) ).to.be.an.instanceof( Date );
			expect( config.get( 'instance' ) ).to.be.an.instanceof( SomeClass );
		} );
	} );

	describe( 'get()', () => {
		it( 'should retrieve a configuration', () => {
			expect( config.get( 'creator' ) ).to.equal( 'inline' );
		} );

		it( 'should retrieve a deep configuration', () => {
			expect( config.get( 'resize.minHeight' ) ).to.equal( 300 );
			expect( config.get( 'resize.icon.path' ) ).to.equal( 'xyz' );
		} );

		it( 'should retrieve a object of the configuration', () => {
			const resize = config.get( 'resize' );

			expect( resize ).to.be.an( 'object' );
			expect( resize.minHeight ).equal( 300 );
			expect( resize.maxHeight ).to.equal( 800 );
			expect( resize.icon ).to.be.an( 'object' );

			expect( resize.icon ).to.be.an( 'object' );
		} );

		it( 'should not retrieve values case-insensitively', () => {
			expect( config.get( 'Creator' ) ).to.be.undefined;
			expect( config.get( 'resize.MINHEIGHT' ) ).to.be.undefined;
		} );

		it( 'should return undefined for non existing configuration', () => {
			expect( config.get( 'invalid' ) ).to.be.undefined;
		} );

		it( 'should return undefined for empty configuration', () => {
			config = new Config();

			expect( config.get( 'invalid' ) ).to.be.undefined;
			expect( config.get( 'deep.invalid' ) ).to.be.undefined;
		} );

		it( 'should return undefined for non existing deep configuration', () => {
			expect( config.get( 'resize.invalid.value' ) ).to.be.undefined;
		} );

		it( 'should not be possible to retrieve value directly from config object', () => {
			expect( config.creator ).to.be.undefined;
			expect( () => {
				config.resize.maxHeight;
			} ).to.throw();
		} );
	} );
} );
