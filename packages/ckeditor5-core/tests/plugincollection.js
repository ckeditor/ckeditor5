/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals setTimeout, console */

import Editor from '../src/editor/editor';
import PluginCollection from '../src/plugincollection';
import Plugin from '../src/plugin';
import ContextPlugin from '../src/contextplugin';
import { expectToThrowCKEditorError, assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

let editor, availablePlugins;
let PluginA, PluginB, PluginC, PluginD, PluginE, PluginF, PluginG, PluginH, PluginI, PluginJ, PluginK, PluginX, PluginFoo, AnotherPluginFoo;
class TestError extends Error {}
class ChildPlugin extends Plugin {}
class GrandPlugin extends ChildPlugin {}

describe( 'PluginCollection', () => {
	before( () => {
		PluginA = createPlugin( 'A' );
		PluginB = createPlugin( 'B' );
		PluginC = createPlugin( 'C' );
		PluginD = createPlugin( 'D' );
		PluginE = createPlugin( 'E' );
		PluginF = createPlugin( 'F' );
		PluginG = createPlugin( 'G', GrandPlugin );
		PluginH = createPlugin( 'H' );
		PluginI = createPlugin( 'I' );
		PluginJ = createPlugin( 'J' );
		PluginK = createPlugin( 'K' );
		PluginX = class extends Plugin {
			constructor( editor ) {
				super( editor );

				throw new TestError( 'Some error inside a plugin' );
			}
		};
		PluginFoo = createPlugin( 'Foo' );
		AnotherPluginFoo = createPlugin( 'Foo' );

		PluginC.requires = [ PluginB ];
		PluginD.requires = [ PluginA, PluginC ];
		PluginF.requires = [ PluginE ];
		PluginE.requires = [ PluginF ];
		PluginH.requires = [ PluginI ];
		PluginJ.requires = [ 'K' ];
		PluginK.requires = [ PluginA ];

		editor = new Editor();
	} );

	beforeEach( () => {
		availablePlugins = [
			PluginA,
			PluginB,
			PluginC,
			PluginD,
			PluginE,
			PluginF,
			PluginG,
			PluginH,
			PluginI,
			PluginJ,
			PluginK,
			PluginX
		];

		PluginFoo.requires = [];
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'load()', () => {
		it( 'should not fail when trying to load 0 plugins (empty array)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] )
				.then( () => {
					expect( getPlugins( plugins ) ).to.be.empty;
				} );
		} );

		it( 'should add collection items for loaded plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginA ) ).to.be.an.instanceof( PluginA );
					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
				} );
		} );

		it( 'should add collection items for loaded plugins using plugin names', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( 'A' ) ).to.be.an.instanceof( PluginA );
					expect( plugins.get( 'B' ) ).to.be.an.instanceof( PluginB );
				} );
		} );

		it( 'should load dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = sinon.spy( plugins, '_add' );

			return plugins.init( [ PluginA, PluginC ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).to.equal( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins._add()' );
					expect( getPluginNames( loadedPlugins ) )
						.to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
				} );
		} );

		it( 'should load dependency plugins defined by plugin names', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = sinon.spy( plugins, '_add' );

			return plugins.init( [ 'J' ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).to.equal( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.to.deep.equal( [ 'A', 'K', 'J' ], 'order by plugins._add()' );
					expect( getPluginNames( loadedPlugins ) )
						.to.deep.equal( [ 'A', 'K', 'J' ], 'order by returned value' );
				} );
		} );

		it( 'should be ok when dependencies are loaded first', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = sinon.spy( plugins, '_add' );

			return plugins.init( [ PluginA, PluginB, PluginC ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).to.equal( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins._add()' );
					expect( getPluginNames( loadedPlugins ) )
						.to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
				} );
		} );

		it( 'should load deep dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = sinon.spy( plugins, '_add' );

			return plugins.init( [ PluginD ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).to.equal( 4 );

					// The order must have dependencies first.
					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by plugins._add()' );
					expect( getPluginNames( loadedPlugins ) )
						.to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by returned value' );
				} );
		} );

		it( 'should handle cross dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = sinon.spy( plugins, '_add' );

			return plugins.init( [ PluginA, PluginE ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).to.equal( 3 );

					// The order must have dependencies first.
					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.to.deep.equal( [ 'A', 'F', 'E' ], 'order by plugins._add()' );
					expect( getPluginNames( loadedPlugins ) )
						.to.deep.equal( [ 'A', 'F', 'E' ], 'order by returned value' );
				} );
		} );

		it( 'should load grand child classes', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginG ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 1 );
				} );
		} );

		it( 'should load plugin which does not extend the base Plugin class', () => {
			class Y {}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ Y ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 1 );
				} );
		} );

		it( 'should load plugin which is a simple function', () => {
			function pluginAsFunction( editor ) {
				this.editor = editor;
			}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ pluginAsFunction ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 1 );
				} );
		} );

		it( 'should set the `editor` property on loaded plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			function pluginAsFunction( editor ) {
				this.editor = editor;
			}

			class Y {
				constructor( editor ) {
					this.editor = editor;
				}
			}

			return plugins.init( [ PluginA, PluginB, pluginAsFunction, Y ] )
				.then( () => {
					expect( plugins.get( PluginA ).editor ).to.equal( editor );
					expect( plugins.get( PluginB ).editor ).to.equal( editor );
					expect( plugins.get( pluginAsFunction ).editor ).to.equal( editor );
					expect( plugins.get( Y ).editor ).to.equal( editor );
				} );
		} );

		it( 'should reject on broken plugins (forward the error thrown in a plugin)', () => {
			const consoleErrorStub = sinon.stub( console, 'error' );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginX, PluginB ] )
				// Throw here, so if by any chance plugins.init() was resolved correctly catch() will be stil executed.
				.then( () => {
					throw new Error( 'Test error: this promise should not be resolved successfully' );
				} )
				.catch( err => {
					expect( err ).to.be.an.instanceof( TestError );
					expect( err ).to.have.property( 'message', 'Some error inside a plugin' );

					sinon.assert.calledOnce( consoleErrorStub );
					expect( consoleErrorStub.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
				} );
		} );

		it( 'should reject when loading non-existent plugin', () => {
			const consoleErrorStub = sinon.stub( console, 'error' );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'NonExistentPlugin' ] )
				// Throw here, so if by any chance plugins.init() was resolved correctly catch() will be stil executed.
				.then( () => {
					throw new Error( 'Test error: this promise should not be resolved successfully' );
				} )
				.catch( err => {
					assertCKEditorError( err, /^plugincollection-plugin-not-found/, editor );

					sinon.assert.calledOnce( consoleErrorStub );
					expect( consoleErrorStub.args[ 0 ][ 0 ] ).to.match( /^plugincollection-plugin-not-found:/ );
				} );
		} );

		it( 'should load chosen plugins (plugins and removePlugins are constructors)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB, PluginC ], [ PluginA ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
					expect( plugins.get( PluginC ) ).to.be.an.instanceof( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are constructors, removePlugins are names)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB, PluginC ], [ 'A' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
					expect( plugins.get( PluginC ) ).to.be.an.instanceof( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins and removePlugins are names)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B', 'C' ], [ 'A' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
					expect( plugins.get( PluginC ) ).to.be.an.instanceof( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are names, removePlugins are constructors)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B', 'C' ], [ PluginA ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
					expect( plugins.get( PluginC ) ).to.be.an.instanceof( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are names, removePlugins contains an anonymous plugin)', () => {
			class AnonymousPlugin {}

			const plugins = new PluginCollection( editor, [ AnonymousPlugin ].concat( availablePlugins ) );

			return plugins.init( [ AnonymousPlugin, 'A', 'B' ], [ AnonymousPlugin ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).to.equal( 2 );

					expect( plugins.get( PluginA ) ).to.be.an.instanceof( PluginA );
					expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
				} );
		} );

		it( 'should throw when context plugin requires not a context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}
			FooContextPlugin.requires = [ PluginA ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, PluginA ] );

			const consoleErrorStub = sinon.stub( console, 'error' );
			let error;

			try {
				await plugins.init( [ FooContextPlugin ] );
			} catch ( err ) {
				error = err;
			}

			assertCKEditorError( error, /^plugincollection-context-required/ );
			sinon.assert.calledOnce( consoleErrorStub );
		} );

		it( 'should not throw when non context plugin requires context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}

			class BarPlugin extends Plugin {}
			BarPlugin.requires = [ FooContextPlugin ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, BarPlugin ] );

			await plugins.init( [ BarPlugin ] );

			expect( getPlugins( plugins ) ).to.length( 2 );
		} );

		it( 'should not throw when context plugin requires context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}

			class BarContextPlugin extends ContextPlugin {}
			BarContextPlugin.requires = [ FooContextPlugin ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, BarContextPlugin ] );

			await plugins.init( [ BarContextPlugin ] );

			expect( getPlugins( plugins ) ).to.length( 2 );
		} );

		it( 'should reject when loaded plugin requires not allowed plugins', () => {
			const consoleErrorStub = sinon.stub( console, 'error' );
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB, PluginC, PluginD ], [ PluginA, PluginB ] )
				// Throw here, so if by any chance plugins.init() was resolved correctly catch() will be still executed.
				.then( () => {
					throw new Error( 'Test error: this promise should not be resolved successfully' );
				} )
				.catch( err => {
					assertCKEditorError( err, /^plugincollection-required/, editor );

					sinon.assert.calledTwice( consoleErrorStub );
				} );
		} );

		it( 'should reject when loading more than one plugin with the same name', () => {
			const plugins = new PluginCollection( editor );
			const consoleErrorStub = sinon.stub( console, 'error' );

			return plugins.init( [ PluginFoo, AnotherPluginFoo ] )
				.then( () => {
					throw new Error( 'The `init()` method should fail.' );
				} )
				.catch( err => {
					assertCKEditorError( err, /^plugincollection-plugin-name-conflict:/, null, {
						pluginName: 'Foo',
						plugin1: PluginFoo,
						plugin2: AnotherPluginFoo
					} );
					sinon.assert.calledOnce( consoleErrorStub );
				} );
		} );

		it( 'should reject when loading more than one plugin with the same name (plugin requires plugin with the same name)', () => {
			PluginFoo.requires = [ AnotherPluginFoo ];

			const plugins = new PluginCollection( editor );
			const consoleErrorStub = sinon.stub( console, 'error' );

			return plugins.init( [ PluginFoo ] )
				.then( () => {
					throw new Error( 'The `init()` method should fail.' );
				} )
				.catch( err => {
					assertCKEditorError( err, /^plugincollection-plugin-name-conflict:/, null );

					sinon.assert.calledOnce( consoleErrorStub );
				} );
		} );

		it( 'should reject when loading more than one plugin with the same name' +
			'(plugin with the same name is built-in the PluginCollection)', () => {
			availablePlugins = [ PluginFoo ];

			const plugins = new PluginCollection( editor, availablePlugins );
			const consoleErrorStub = sinon.stub( console, 'error' );

			return plugins.init( [ 'Foo', AnotherPluginFoo ] )
				.then( () => {
					throw new Error( 'The `init()` method should fail.' );
				} )
				.catch( err => {
					assertCKEditorError( err, /^plugincollection-plugin-name-conflict:/, null );
					sinon.assert.calledOnce( consoleErrorStub );
				} );
		} );

		it( 'should get plugin from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ PluginA ] );

			expect( getPlugins( plugins ) ).to.length( 1 );
			expect( plugins.get( PluginA ) ).to.equal( externalPlugins.get( PluginA ) ).to.instanceof( PluginA );
		} );

		it( 'should get plugin by name from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ 'A' ] );

			expect( getPlugins( plugins ) ).to.length( 1 );
			expect( plugins.get( PluginA ) ).to.equal( externalPlugins.get( PluginA ) ).to.instanceof( PluginA );
		} );

		it( 'should get dependency of plugin from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ PluginC ] );

			expect( getPlugins( plugins ) ).to.length( 2 );
			expect( plugins.get( PluginB ) ).to.equal( externalPlugins.get( PluginB ) ).to.instanceof( PluginB );
			expect( plugins.get( PluginC ) ).to.instanceof( PluginC );
		} );
	} );

	describe( 'get()', () => {
		it( 'retrieves plugin by its constructor', () => {
			class SomePlugin extends Plugin {}

			availablePlugins.push( SomePlugin );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ SomePlugin ] )
				.then( () => {
					expect( plugins.get( SomePlugin ) ).to.be.instanceOf( SomePlugin );
				} );
		} );

		it( 'retrieves plugin by its name and constructor', () => {
			class SomePlugin extends Plugin {}
			SomePlugin.pluginName = 'foo/bar';

			availablePlugins.push( SomePlugin );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ SomePlugin ] )
				.then( () => {
					expect( plugins.get( 'foo/bar' ) ).to.be.instanceOf( SomePlugin );
					expect( plugins.get( SomePlugin ) ).to.be.instanceOf( SomePlugin );
				} );
		} );

		it( 'throws if plugin cannot be retrieved by name', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( 'foo' ),
					/^plugincollection-plugin-not-loaded:/, editor, { plugin: 'foo' }
				);
			} );
		} );

		it( 'throws if plugin cannot be retrieved by class', () => {
			class SomePlugin extends Plugin {}
			SomePlugin.pluginName = 'foo';

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( SomePlugin ),
					/^plugincollection-plugin-not-loaded:/, editor, { plugin: 'foo' } );
			} );
		} );

		it( 'throws if plugin cannot be retrieved by class (class name in error)', () => {
			class SomePlugin extends Plugin {}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( SomePlugin ),
					/^plugincollection-plugin-not-loaded:/,
					editor, { plugin: 'SomePlugin' }
				);
			} );
		} );
	} );

	describe( 'has()', () => {
		let plugins;

		beforeEach( () => {
			plugins = new PluginCollection( editor, availablePlugins );
		} );

		it( 'returns false if plugins is not loaded (retrieved by name)', () => {
			expect( plugins.has( 'foobar' ) ).to.be.false;
		} );

		it( 'returns false if plugins is not loaded (retrieved by class)', () => {
			class SomePlugin extends Plugin {
			}

			expect( plugins.has( SomePlugin ) ).to.be.false;
		} );

		it( 'returns true if plugins is loaded (retrieved by name)', () => {
			return plugins.init( [ PluginA ] ).then( () => {
				expect( plugins.has( 'A' ) ).to.be.true;
			} );
		} );

		it( 'returns true if plugins is loaded (retrieved by class)', () => {
			return plugins.init( [ PluginA ] ).then( () => {
				expect( plugins.has( PluginA ) ).to.be.true;
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls Plugin#destroy() method on every loaded plugin', () => {
			let destroySpyForPluginA, destroySpyForPluginB;

			const plugins = new PluginCollection( editor, [] );

			return plugins.init( [ PluginA, PluginB ] )
				.then( () => {
					destroySpyForPluginA = sinon.spy( plugins.get( PluginA ), 'destroy' );
					destroySpyForPluginB = sinon.spy( plugins.get( PluginB ), 'destroy' );

					return plugins.destroy();
				} )
				.then( () => {
					expect( destroySpyForPluginA.calledOnce ).to.equal( true );
					expect( destroySpyForPluginB.calledOnce ).to.equal( true );
				} );
		} );

		it( 'waits until all plugins are destroyed', () => {
			const destroyedPlugins = [];

			class AsynchronousPluginA extends Plugin {
				destroy() {
					return new Promise( resolve => {
						setTimeout( () => {
							super.destroy();

							destroyedPlugins.push( 'AsynchronousPluginA.destroy()' );
							resolve();
						} );
					} );
				}
			}

			class AsynchronousPluginB extends Plugin {
				destroy() {
					return new Promise( resolve => {
						setTimeout( () => {
							super.destroy();

							destroyedPlugins.push( 'AsynchronousPluginB.destroy()' );
							resolve();
						} );
					} );
				}
			}

			const plugins = new PluginCollection( editor, [] );

			return plugins.init( [ AsynchronousPluginA, AsynchronousPluginB ] )
				.then( () => plugins.destroy() )
				.then( () => {
					expect( destroyedPlugins ).to.contain( 'AsynchronousPluginB.destroy()' );
					expect( destroyedPlugins ).to.contain( 'AsynchronousPluginA.destroy()' );
				} );
		} );

		it( 'does not execute Plugin#destroy() for plugins which do not have this method', () => {
			class FooPlugin {
				constructor( editor ) {
					this.editor = editor;
				}
			}

			const plugins = new PluginCollection( editor, [] );

			return plugins.init( [ PluginA, FooPlugin ] )
				.then( () => plugins.destroy() )
				.then( destroyedPlugins => {
					expect( destroyedPlugins.length ).to.equal( 1 );
				} );
		} );
	} );

	describe( 'iterator', () => {
		it( 'exists', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			expect( plugins ).to.have.property( Symbol.iterator );
		} );

		it( 'returns only plugins by constructors', () => {
			class SomePlugin1 extends Plugin {}
			class SomePlugin2 extends Plugin {}
			SomePlugin2.pluginName = 'foo/bar';

			availablePlugins.push( SomePlugin1 );
			availablePlugins.push( SomePlugin2 );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ SomePlugin1, SomePlugin2 ] )
				.then( () => {
					const pluginConstructors = Array.from( plugins )
						.map( entry => entry[ 0 ] );

					expect( pluginConstructors ).to.have.members( [ SomePlugin1, SomePlugin2 ] );
				} );
		} );
	} );
} );

function createPlugin( name ) {
	const P = class extends Plugin {
		constructor( editor ) {
			super( editor );
			this.pluginName = name;
		}
	};

	P.pluginName = name;

	return P;
}

function getPlugins( pluginCollection ) {
	return Array.from( pluginCollection )
		.map( entry => entry[ 1 ] ); // Get instances.
}

function getPluginsFromSpy( addSpy ) {
	return addSpy.args
		.map( arg => arg[ 0 ] )
		// Entries may be kept twice in the plugins map - once as a pluginName => plugin, once as pluginClass => plugin.
		// Return only pluginClass => plugin entries as these will always represent all plugins.
		.filter( plugin => typeof plugin == 'function' );
}

function getPluginNames( plugins ) {
	return plugins.map( plugin => plugin.pluginName );
}
