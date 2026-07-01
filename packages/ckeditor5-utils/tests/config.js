/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { Config } from '../src/config.js';
import { areConnectedThroughProperties } from '../src/areconnectedthroughproperties.js';

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
			toolbar: 'top',
			options: {
				foo: [
					{ bar: 'b' },
					{ bar: 'a' },
					{ bar: 'z' }
				],
				callback: () => null
			},
			callback: () => null
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should set configurations', () => {
			expect( config.get( 'creator' ) ).toBe( 'inline' );
			expect( config.get( 'language' ) ).toBe( 'pl' );
			expect( config.get( 'resize' ) ).toEqual( {
				minHeight: 300,
				maxHeight: 800,
				icon: {
					path: 'xyz'
				}
			} );
			expect( config.get( 'toolbar' ) ).toBe( 'top' );
		} );

		it( 'should work with no parameters', () => {
			// No error should be thrown.
			config = new Config();
		} );

		it( 'should set default parameters', () => {
			const defaultConfig = {
				foo: 1,
				bar: 2
			};

			config = new Config( {}, defaultConfig );

			expect( config.get( 'foo' ) ).toBe( 1 );
			expect( config.get( 'bar' ) ).toBe( 2 );
		} );

		it( 'should copy default configuration to not share properties between config instances [watchdog]', () => {
			const defaultConfig = {
				foo: 1,
				bar: [
					/some regex/,
					{
						baz: {}
					}
				]
			};

			const config1 = new Config( {}, defaultConfig );
			const config2 = new Config( {}, defaultConfig );

			const areStructuresConnected = areConnectedThroughProperties( config1, config2 );

			expect( areStructuresConnected ).toBe( false );
		} );

		it( 'passed parameters should override default parameters', () => {
			const defaultConfig = {
				foo: 1,
				bar: 2
			};

			config = new Config( {
				foo: 10
			}, defaultConfig );

			expect( config.get( 'foo' ) ).toBe( 10 );
			expect( config.get( 'bar' ) ).toBe( 2 );
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
						second: 2
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

			expect( config.get( 'a' ) ).toEqual( {
				first: 1,
				second: 2,
				third: 3
			} );

			expect( Object.keys( config.get( 'b' ) ) ).toEqual( [ 'foo' ] );

			expect( config.get( 'b.foo' ) ).toEqual( {
				first: 3,
				second: 2,
				third: 1
			} );

			expect( config.get( 'custom' ) ).toBe( 'foo' );
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

			expect( config.get( 'option1' ) ).toBe( 1 );
			expect( config.get( 'option2.subOption21' ) ).toBe( 21 );
		} );

		it( 'should set configurations when passing name and value', () => {
			config.set( 'something', 'anything' );

			expect( config.get( 'something' ) ).toBe( 'anything' );
		} );

		it( 'should set configurations when passing name.with.deep and value', () => {
			config.set( 'color.red', 'f00' );
			config.set( 'background.color.blue', '00f' );

			expect( config.get( 'color.red' ) ).toBe( 'f00' );
			expect( config.get( 'background.color.blue' ) ).toBe( '00f' );
		} );

		it( 'should replace a simple entry with an object', () => {
			config.set( 'test', 1 );
			config.set( 'test', {
				prop: 1
			} );

			expect( config.get( 'test' ) ).toBeTypeOf( 'object' );
			expect( config.get( 'test.prop' ) ).toBe( 1 );
		} );

		it( 'should replace a simple entry with an object when passing only object', () => {
			config.set( 'test', 1 );
			config.set( {
				test: {
					prop: 1
				}
			} );

			expect( config.get( 'test' ) ).toBeTypeOf( 'object' );
			expect( config.get( 'test.prop' ) ).toBe( 1 );
		} );

		it( 'should replace a simple entry with an object when passing a name.with.deep', () => {
			config.set( 'test.prop', 1 );
			config.set( 'test.prop.value', 1 );

			expect( config.get( 'test' ) ).toBeTypeOf( 'object' );
			expect( config.get( 'test.prop' ) ).toBeTypeOf( 'object' );
			expect( config.get( 'test.prop.value' ) ).toBe( 1 );
		} );

		it( 'should override and expand deep configurations', () => {
			/* eslint-disable @stylistic/no-multi-spaces */
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

			expect( config.get( 'resize' ) ).toEqual( {
				minHeight: 400,		// Overridden
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'abc',	// Overridden
					url: true		// Expanded
				}
			} );
			/* eslint-enable @stylistic/no-multi-spaces */
		} );

		it( 'should override and expand object when passing an object', () => {
			/* eslint-disable @stylistic/no-multi-spaces */
			config.set( 'resize', {
				minHeight: 400,		// Override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// Override
					url: true		// Expand
				}
			} );

			expect( config.get( 'resize' ) ).toEqual( {
				minHeight: 400,		// Overridden
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'abc',	// Overridden
					url: true		// Expanded
				}
			} );
			/* eslint-enable @stylistic/no-multi-spaces */
		} );

		it( 'should not create object for non-pure objects', () => {
			function SomeClass() {}

			config.set( 'date', new Date() );
			config.set( {
				instance: new SomeClass()
			} );

			expect( config.get( 'date' ) ).toBeInstanceOf( Date );
			expect( config.get( 'instance' ) ).toBeInstanceOf( SomeClass );
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

			expect( config.get( 'option1' ) ).toBe( 1 );
			expect( config.get( 'option2.subOption21' ) ).toBe( 21 );
		} );

		it( 'should set configurations when passing name and value', () => {
			config.set( 'something', 'anything' );

			expect( config.get( 'something' ) ).toBe( 'anything' );
		} );

		it( 'should set configurations when passing name.with.deep and value', () => {
			config.set( 'color.red', 'f00' );
			config.set( 'background.color.blue', '00f' );

			expect( config.get( 'color.red' ) ).toBe( 'f00' );
			expect( config.get( 'background.color.blue' ) ).toBe( '00f' );
		} );

		it( 'should not replace already defined values', () => {
			config.define( 'language', 'en' );
			config.define( 'resize.minHeight', 400 );
			config.define( 'resize.icon', 'some value' );

			expect( config.get( 'language' ) ).toBe( 'pl' );
			expect( config.get( 'resize.icon' ) ).toBeTypeOf( 'object' );
			expect( config.get( 'resize.minHeight' ) ).toBe( 300 );
		} );

		it( 'should expand but not override deep configurations', () => {
			/* eslint-disable @stylistic/no-multi-spaces */
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

			expect( config.get( 'resize' ) ).toEqual( {
				minHeight: 300,		// The same
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'xyz',	// The same
					url: true		// Expanded
				}
			} );
			/* eslint-enable @stylistic/no-multi-spaces */
		} );

		it( 'should expand but not override when passing an object', () => {
			/* eslint-disable @stylistic/no-multi-spaces */
			config.define( 'resize', {
				minHeight: 400,		// No override
				hidden: true,		// Expand
				icon: {
					path: 'abc',	// No override
					url: true		// Expand
				}
			} );

			expect( config.get( 'resize' ) ).toEqual( {
				minHeight: 300,		// The same
				maxHeight: 800,		// The same
				hidden: true,		// Expanded
				icon: {
					path: 'xyz',	// The same
					url: true		// Expanded
				}
			} );
			/* eslint-enable @stylistic/no-multi-spaces */
		} );

		it( 'should not create an object for non-pure objects', () => {
			function SomeClass() {}

			config.define( 'date', new Date() );
			config.define( {
				instance: new SomeClass()
			} );

			expect( config.get( 'date' ) ).toBeInstanceOf( Date );
			expect( config.get( 'instance' ) ).toBeInstanceOf( SomeClass );
		} );
	} );

	describe( 'get()', () => {
		it( 'should retrieve a configuration', () => {
			expect( config.get( 'creator' ) ).toBe( 'inline' );
		} );

		it( 'should retrieve a deep configuration', () => {
			expect( config.get( 'resize.minHeight' ) ).toBe( 300 );
			expect( config.get( 'resize.icon.path' ) ).toBe( 'xyz' );
		} );

		it( 'should return a function', () => {
			expect( typeof config.get( 'callback' ) ).toBe( 'function' );
			expect( config.get( 'callback' )() ).toBe( null );
		} );

		it( 'should return a function nested in option', () => {
			expect( typeof config.get( 'options.callback' ) ).toBe( 'function' );
			expect( config.get( 'options.callback' )() ).toBe( null );
		} );

		it( 'should retrieve an object of the configuration', () => {
			const resize = config.get( 'resize' );

			expect( resize ).toBeTypeOf( 'object' );
			expect( resize.minHeight ).toBe( 300 );
			expect( resize.maxHeight ).toBe( 800 );
			expect( resize.icon ).toBeTypeOf( 'object' );

			expect( resize.icon ).toBeTypeOf( 'object' );
		} );

		it( 'should not retrieve values case-insensitively', () => {
			expect( config.get( 'Creator' ) ).toBeUndefined();
			expect( config.get( 'resize.MINHEIGHT' ) ).toBeUndefined();
		} );

		it( 'should return undefined for non existing configuration', () => {
			expect( config.get( 'invalid' ) ).toBeUndefined();
		} );

		it( 'should return undefined for empty configuration', () => {
			config = new Config();

			expect( config.get( 'invalid' ) ).toBeUndefined();
			expect( config.get( 'deep.invalid' ) ).toBeUndefined();
		} );

		it( 'should return undefined for non existing deep configuration', () => {
			expect( config.get( 'resize.invalid.value' ) ).toBeUndefined();
		} );

		it( 'should not be possible to retrieve value directly from config object', () => {
			expect( config.creator ).toBeUndefined();
			// Check if 'resize.maxHeight' would be accessible;
			expect( config.resize ).toBeUndefined();
		} );

		it( 'should not be possible to alter config object by altering returned value', () => {
			expect( config.get( 'resize.icon.path' ) ).toBe( 'xyz' );

			const icon = config.get( 'resize.icon' );
			icon.path = 'foo/bar';

			expect( config.get( 'resize.icon.path' ) ).toBe( 'xyz' );

			const resize = config.get( 'resize' );
			resize.icon.path = 'foo/baz';

			expect( config.get( 'resize.icon.path' ) ).toBe( 'xyz' );
		} );

		it( 'should not be possible to alter array in config by altering returned value', () => {
			expect( config.get( 'options.foo' ) ).toEqual( [ { bar: 'b' }, { bar: 'a' }, { bar: 'z' } ] );

			const fooOptions = config.get( 'options.foo' );
			fooOptions.pop();

			expect( config.get( 'options.foo' ) ).toEqual( [ { bar: 'b' }, { bar: 'a' }, { bar: 'z' } ] );

			const options = config.get( 'options' );
			options.foo.pop();

			expect( config.get( 'options.foo' ) ).toEqual( [ { bar: 'b' }, { bar: 'a' }, { bar: 'z' } ] );
		} );

		it( 'should return class & functions references from config array', () => {
			class Foo {
			}

			function bar() {
				return 'bar';
			}

			const baz = () => 'baz';

			config.set( 'plugins', [ Foo, bar, baz ] );

			expect( config.get( 'plugins' ) ).toEqual( [ Foo, bar, baz ] );

			const plugins = config.get( 'plugins' );

			expect( plugins[ 0 ] ).toBe( Foo );
			expect( plugins[ 1 ] ).toBe( bar );
			expect( plugins[ 2 ] ).toBe( baz );

			const pluginsAgain = config.get( 'plugins' );

			// The returned array should be a new instance:
			expect( pluginsAgain ).not.toBe( plugins );

			// But array members should remain the same contents should be equal:
			expect( pluginsAgain ).toEqual( plugins );
		} );

		it( 'should return DOM nodes references from config array', () => {
			const foo = document.createElement( 'div' );

			config.set( 'node', foo );
			config.set( 'nodes', [ foo ] );

			expect( config.get( 'node' ) ).toBe( foo );
			expect( config.get( 'nodes' ) ).toEqual( [ foo ] );

			const nodes = config.get( 'nodes' );

			expect( nodes[ 0 ] ).toBe( foo );

			const nodesAgain = config.get( 'nodes' );

			// The returned array should be a new instance:
			expect( nodesAgain ).not.toBe( nodes );

			// But array members should remain the same contents should be equal:
			expect( nodesAgain ).toEqual( nodes );
		} );
	} );

	describe( 'names()', () => {
		it( 'should return an iterator of top level names of the configuration', () => {
			expect( Array.from( config.names() ) ).toEqual(
				[ 'creator', 'language', 'resize', 'toolbar', 'options', 'callback' ]
			);
		} );
	} );
} );
