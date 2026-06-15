/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { Editor } from '../src/editor/editor.js';
import { PluginCollection } from '../src/plugincollection.js';
import { Command } from '../src/command.js';
import { Context } from '../src/context.js';
import { Plugin } from '../src/plugin.js';
import { ContextPlugin } from '../src/contextplugin.js';
import { expectToThrowCKEditorError, expectToRejectWithCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let editor, availablePlugins;
let PluginA, PluginB, PluginC, PluginD, PluginE, PluginF, PluginG, PluginH, PluginI, PluginJ, PluginK, PluginX, PluginFoo, AnotherPluginFoo;
class TestError extends Error {}

describe( 'PluginCollection', () => {
	beforeAll( () => {
		PluginA = createPlugin( 'A' );
		PluginB = createPlugin( 'B' );
		PluginC = createPlugin( 'C' );
		PluginD = createPlugin( 'D' );
		PluginE = createPlugin( 'E' );
		PluginF = createPlugin( 'F' );
		PluginG = createPlugin( 'G' );
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

	afterEach( async () => {
		editor.state = 'ready';
		await editor.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'init()', () => {
		it( 'should resolve successfully when trying to load 0 plugins (empty array)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] )
				.then( () => {
					expect( getPlugins( plugins ) ).toHaveLength( 0 );
				} );
		} );

		it( 'should add collection items for loaded plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginA ) ).toBeInstanceOf( PluginA );
					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
				} );
		} );

		it( 'should add collection items for loaded plugins using plugin names', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( 'A' ) ).toBeInstanceOf( PluginA );
					expect( plugins.get( 'B' ) ).toBeInstanceOf( PluginB );
				} );
		} );

		it( 'should load dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginA, PluginC ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'C' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'C' ] );
				} );
		} );

		it( 'should load dependency plugins defined by plugin names', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ 'J' ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'K', 'J' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'K', 'J' ] );
				} );
		} );

		it( 'should be ok when dependencies are loaded first', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginA, PluginB, PluginC ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'C' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'C' ] );
				} );
		} );

		it( 'should load deep dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginD ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 4 );

					// The order must have dependencies first.
					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'C', 'D' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'C', 'D' ] );
				} );
		} );

		it( 'should handle cross dependency plugins', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginA, PluginE ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					// The order must have dependencies first.
					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'F', 'E' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'F', 'E' ] );
				} );
		} );

		it( 'should load grand child classes', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			class ChildPlugin extends Plugin {}
			class GrandPlugin extends ChildPlugin {}

			return plugins.init( [ GrandPlugin ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 1 );
				} );
		} );

		it( 'should load plugin which does not extend the base Plugin class', () => {
			class Y {}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ Y ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 1 );
				} );
		} );

		it( 'should load plugin which is a simple function', () => {
			function pluginAsFunction( editor ) {
				this.editor = editor;
			}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ pluginAsFunction ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 1 );
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
					expect( plugins.get( PluginA ).editor ).toBe( editor );
					expect( plugins.get( PluginB ).editor ).toBe( editor );
					expect( plugins.get( pluginAsFunction ).editor ).toBe( editor );
					expect( plugins.get( Y ).editor ).toBe( editor );
				} );
		} );

		it( 'should reject on broken plugins (forward the error thrown in a plugin)', async () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			let error;

			await plugins.init( [ PluginA, PluginX, PluginB ] )
				// Throw here, so if by any chance plugins.init() was resolved correctly catch() will be stil executed.
				.then( () => {
					throw new Error( 'Test error: this promise should not be resolved successfully' );
				} )
				.catch( err => {
					error = err;
				} );

			expect( error ).toBeInstanceOf( TestError );
			expect( error ).toHaveProperty( 'message', 'Some error inside a plugin' );
		} );

		it( 'should reject when loading non-existent plugin', async () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			await expectToRejectWithCKEditorError( plugins.init( [ 'NonExistentPlugin' ] ), 'plugincollection-plugin-not-found', editor );
		} );

		it( 'should load chosen plugins (plugins and removePlugins are constructors)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB, PluginC ], [ PluginA ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					expect( plugins.get( PluginC ) ).toBeInstanceOf( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are constructors, removePlugins are names)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ PluginA, PluginB, PluginC ], [ 'A' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					expect( plugins.get( PluginC ) ).toBeInstanceOf( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins and removePlugins are names)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B', 'C' ], [ 'A' ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					expect( plugins.get( PluginC ) ).toBeInstanceOf( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are names, removePlugins are constructors)', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ 'A', 'B', 'C' ], [ PluginA ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					expect( plugins.get( PluginC ) ).toBeInstanceOf( PluginC );
				} );
		} );

		it( 'should load chosen plugins (plugins are names, removePlugins contains an anonymous plugin)', () => {
			class AnonymousPlugin {}

			const plugins = new PluginCollection( editor, [ AnonymousPlugin ].concat( availablePlugins ) );

			return plugins.init( [ AnonymousPlugin, 'A', 'B' ], [ AnonymousPlugin ] )
				.then( () => {
					expect( getPlugins( plugins ).length ).toBe( 2 );

					expect( plugins.get( PluginA ) ).toBeInstanceOf( PluginA );
					expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
				} );
		} );

		it( 'should reject when context plugin requires not a context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}
			FooContextPlugin.requires = [ PluginA ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, PluginA ] );

			await expectToRejectWithCKEditorError( plugins.init( [ FooContextPlugin ] ), /^plugincollection-context-required/ );
		} );

		it( 'should resolve successfully when non context plugin requires context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}

			class BarPlugin extends Plugin {}
			BarPlugin.requires = [ FooContextPlugin ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, BarPlugin ] );

			await plugins.init( [ BarPlugin ] );

			expect( getPlugins( plugins ) ).toHaveLength( 2 );
		} );

		it( 'should resolve successfully when context plugin requires context plugin', async () => {
			class FooContextPlugin extends ContextPlugin {}

			class BarContextPlugin extends ContextPlugin {}
			BarContextPlugin.requires = [ FooContextPlugin ];

			const plugins = new PluginCollection( editor, [ FooContextPlugin, BarContextPlugin ] );

			await plugins.init( [ BarContextPlugin ] );

			expect( getPlugins( plugins ) ).toHaveLength( 2 );
		} );

		it( 'should reject when loaded plugin requires not allowed plugins', async () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			await expectToRejectWithCKEditorError(
				plugins.init( [ PluginA, PluginB, PluginC, PluginD ], [ PluginA, PluginB ] ),
				/^plugincollection-required/,
				editor
			);
		} );

		it( 'should reject when loading more than one plugin with the same name', async () => {
			const plugins = new PluginCollection( editor );

			await expectToRejectWithCKEditorError(
				plugins.init( [ PluginFoo, AnotherPluginFoo ] ),
				/^plugincollection-plugin-name-conflict/,
				null,
				{
					pluginName: 'Foo',
					plugin1: PluginFoo,
					plugin2: AnotherPluginFoo
				}
			);
		} );

		it( 'should reject when loading more than one plugin with the same name (plugin requires plugin with the same name)', async () => {
			PluginFoo.requires = [ AnotherPluginFoo ];

			const plugins = new PluginCollection( editor );

			await expectToRejectWithCKEditorError( plugins.init( [ PluginFoo ] ), /^plugincollection-plugin-name-conflict/, null );
		} );

		it( 'should reject when loading more than one plugin with the same name ' +
			'(plugin with the same name is built-in the PluginCollection)', async () => {
			availablePlugins = [ PluginFoo ];

			const plugins = new PluginCollection( editor, availablePlugins );

			await expectToRejectWithCKEditorError(
				plugins.init( [ 'Foo', AnotherPluginFoo ] ),
				/^plugincollection-plugin-name-conflict/,
				null
			);
		} );

		it( 'should get plugin from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ PluginA ] );

			expect( getPlugins( plugins ) ).toHaveLength( 1 );
			expect( plugins.get( PluginA ) ).toBe( externalPlugins.get( PluginA ) );
			expect( plugins.get( PluginA ) ).toBeInstanceOf( PluginA );
		} );

		it( 'should get plugin by name from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ 'A' ] );

			expect( getPlugins( plugins ) ).toHaveLength( 1 );
			expect( plugins.get( PluginA ) ).toBe( externalPlugins.get( PluginA ) );
			expect( plugins.get( PluginA ) ).toBeInstanceOf( PluginA );
		} );

		it( 'should get dependency of plugin from external plugins instead of creating new instance', async () => {
			const externalPlugins = new PluginCollection( editor );
			await externalPlugins.init( [ PluginA, PluginB ] );

			const plugins = new PluginCollection( editor, [], Array.from( externalPlugins ) );
			await plugins.init( [ PluginC ] );

			expect( getPlugins( plugins ) ).toHaveLength( 2 );
			expect( plugins.get( PluginB ) ).toBe( externalPlugins.get( PluginB ) );
			expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
			expect( plugins.get( PluginC ) ).toBeInstanceOf( PluginC );
		} );

		it( 'should load dependency plugins using soft requirement', () => {
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginJ ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'K', 'J' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'K', 'J' ] );
				} );
		} );

		it( 'should reject dependency plugins using soft requirement when plugin is unavailable', async () => {
			PluginFoo.requires = [ 'A', 'Baz' ];

			const plugins = new PluginCollection( editor, availablePlugins );

			await expectToRejectWithCKEditorError(
				plugins.init( [ PluginFoo ] ),
				/^plugincollection-soft-required/,
				editor,
				{ missingPlugin: 'Baz', requiredBy: 'Foo' }
			);
		} );

		// #18072
		describe( 'invalid plugin types', () => {
			it( 'should reject when `Editor` constructor is specified as a plugin', async () => {
				const plugins = new PluginCollection( editor );

				await expectToRejectWithCKEditorError(
					plugins.init( [ Editor ] ),
					'plugincollection-plugin-invalid-constructor',
					editor,
					{ name: 'Editor' }
				);
			} );

			it( 'should reject when `Editor` sub-class constructor is specified as a plugin', async () => {
				class CustomEditor extends Editor {};

				const plugins = new PluginCollection( editor );

				await expectToRejectWithCKEditorError(
					plugins.init( [ CustomEditor ] ),
					'plugincollection-plugin-invalid-constructor',
					editor,
					{ name: 'CustomEditor' }
				);
			} );

			it( 'should reject when `Command` constructor is specified as a plugin', async () => {
				const plugins = new PluginCollection( editor );

				await expectToRejectWithCKEditorError(
					plugins.init( [ Command ] ),
					'plugincollection-plugin-invalid-constructor',
					editor,
					{ name: 'Command' }
				);
			} );

			it( 'should reject when `Command` sub-class constructor is specified as a plugin', async () => {
				class CustomCommand extends Command {};

				const plugins = new PluginCollection( editor );

				await expectToRejectWithCKEditorError(
					plugins.init( [ CustomCommand ] ),
					'plugincollection-plugin-invalid-constructor',
					editor,
					{ name: 'CustomCommand' }
				);
			} );

			it( 'should reject when `Context` constructor is specified as a plugin', async () => {
				const plugins = new PluginCollection( editor );

				await expectToRejectWithCKEditorError(
					plugins.init( [ Context ] ),
					'plugincollection-plugin-invalid-constructor',
					editor,
					{ name: 'Context' }
				);
			} );
		} );

		it( 'should load dependency plugins using soft requirement when plugin was loaded as dependency of other plugin', () => {
			PluginFoo.requires = [ 'A' ];
			const plugins = new PluginCollection( editor, availablePlugins );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginD, PluginFoo ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 5 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'C', 'D', 'Foo' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'C', 'D', 'Foo' ] );
				} );
		} );

		it( 'should load dependency plugins using soft requirement if non-built-in plugin is available further in the plugin list', () => {
			PluginFoo.requires = [ 'A', 'B' ];
			const plugins = new PluginCollection( editor, [] );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginFoo, PluginA, PluginB ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 3 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'Foo' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'Foo' ] );
				} );
		} );

		it( 'should load dependency plugins using soft requirement if non-built-in plugin is available further as other dependency', () => {
			PluginFoo.requires = [ 'A', 'B' ];
			const plugins = new PluginCollection( editor, [] );
			const spy = vi.spyOn( plugins, '_add' );

			return plugins.init( [ PluginFoo, PluginD ] )
				.then( loadedPlugins => {
					expect( getPlugins( plugins ).length ).toBe( 5 );

					expect( getPluginNames( getPluginsFromSpy( spy ) ) )
						.toEqual( [ 'A', 'B', 'Foo', 'C', 'D' ] );
					expect( getPluginNames( loadedPlugins ) )
						.toEqual( [ 'A', 'B', 'Foo', 'C', 'D' ] );
				} );
		} );

		describe( 'substituting plugins', () => {
			afterEach( () => {
				PluginA.prototype.init = undefined;
				PluginA.requires = undefined;
			} );

			it( 'allows replacing a plugin in the "availablePlugins" collection (constructor)', () => {
				const plugins = new PluginCollection( editor, [ PluginA, PluginB ] );

				PluginA.prototype.init = function() {
					throw new Error( 'Foo' );
				};

				const newPluginA = createPlugin( 'A' );

				return plugins.init( [ 'A', 'B' ], [], [ newPluginA ] )
					.then( () => {
						expect( getPlugins( plugins ).length ).toBe( 2 );

						expect( plugins.get( newPluginA ) ).toBeInstanceOf( newPluginA );
						expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					} );
			} );

			it( 'allows replacing a plugin in the "plugins" collection (init)', () => {
				const plugins = new PluginCollection( editor, [] );

				PluginA.prototype.init = function() {
					throw new Error( 'Foo' );
				};

				const newPluginA = createPlugin( 'A' );

				return plugins.init( [ PluginA, PluginB ], [], [ newPluginA ] )
					.then( () => {
						expect( getPlugins( plugins ).length ).toBe( 2 );

						expect( plugins.get( newPluginA ) ).toBeInstanceOf( newPluginA );
						expect( plugins.get( PluginB ) ).toBeInstanceOf( PluginB );
					} );
			} );

			it( 'returns rejected promise if plugin for replacement is specified as a string', async () => {
				const plugins = new PluginCollection( editor, [] );

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [], [ 'A' ] ),
					'plugincollection-replace-plugin-invalid-type',
					null,
					{
						pluginItem: 'A'
					}
				);
			} );

			it( 'returns rejected promise if plugin for replacement is not named', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );
				newPluginA.pluginName = undefined;

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [], [ newPluginA ] ),
					'plugincollection-replace-plugin-missing-name',
					null,
					{ pluginItem: newPluginA }
				);
			} );

			it( 'returns rejected promise if plugin for replacement requires other plugins (soft requirements)', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );

				newPluginA.requires = [ 'Foo' ];

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [], [ newPluginA ] ),
					'plugincollection-plugin-for-replacing-cannot-have-dependencies',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if plugin for replacement requires other plugins (hard requirements)', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );

				newPluginA.requires = [ PluginC ];

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [], [ newPluginA ] ),
					'plugincollection-plugin-for-replacing-cannot-have-dependencies',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if the replaced requires other plugins (soft requirements)', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );

				PluginA.requires = [ 'Foo' ];

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB, PluginFoo ], [], [ newPluginA ] ),
					'plugincollection-replaced-plugin-cannot-have-dependencies',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if the replaced requires other plugins (hard requirements)', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );

				PluginA.requires = [ PluginC ];

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [], [ newPluginA ] ),
					'plugincollection-replaced-plugin-cannot-have-dependencies',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if plugin for replacement exists (in "availablePlugins") but it will not be loaded', async () => {
				const plugins = new PluginCollection( editor, [ PluginA ] );

				const newPluginA = createPlugin( 'A' );

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginB ], [], [ newPluginA ] ),
					'plugincollection-plugin-for-replacing-not-loaded',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if plugin for replacement does not exist', async () => {
				const plugins = new PluginCollection( editor, [] );

				const newPluginA = createPlugin( 'A' );

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginB ], [], [ newPluginA ] ),
					'plugincollection-plugin-for-replacing-not-exist',
					null,
					{ pluginName: 'A' }
				);
			} );

			it( 'returns rejected promise if replacing a removed plugin', async () => {
				const plugins = new PluginCollection( editor, availablePlugins );

				const newPluginA = createPlugin( 'A' );

				await expectToRejectWithCKEditorError(
					plugins.init( [ PluginA, PluginB ], [ 'A' ], [ newPluginA ] ),
					'plugincollection-plugin-for-replacing-not-loaded',
					null,
					{ pluginName: 'A' }
				);
			} );

			// The Context feature has an own list of plugins that can be also substituted.
			// Also, the context can be a part of an editor instance which means, that the context's
			// plugins will be a part of the editor's plugins. However, the editor will not initialize the plugin,
			// hence the substitute option could throw an error "plugincollection-plugin-for-replacing-not-loaded".
			it( 'does not reject with an error if a plugin for substitute was loaded by the Context feature', async () => {
				class ContextPluginA extends ContextPlugin {
					static get pluginName() {
						return 'ContextPluginA';
					}
				}
				class ContextPluginB extends ContextPlugin {
					static get pluginName() {
						return 'ContextPluginB';
					}

					static get requires() {
						return [ ContextPluginA ];
					}
				}

				class ContextPluginMockA extends ContextPlugin {
					static get pluginName() {
						return 'ContextPluginA';
					}
				}

				const sharedConfig = {
					plugins: [ ContextPluginB ],
					substitutePlugins: [ ContextPluginMockA ]
				};

				const context = new Context( sharedConfig );

				await context.initPlugins();

				const plugins = new PluginCollection( editor, [ PluginA ], context.plugins );

				return plugins.init( sharedConfig.plugins, [], sharedConfig.substitutePlugins );
			} );
		} );
	} );

	describe( 'get()', () => {
		it( 'retrieves plugin by its constructor', () => {
			class SomePlugin extends Plugin {}

			availablePlugins.push( SomePlugin );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ SomePlugin ] )
				.then( () => {
					expect( plugins.get( SomePlugin ) ).toBeInstanceOf( SomePlugin );
				} );
		} );

		it( 'retrieves plugin by its name and constructor', () => {
			class SomePlugin extends Plugin {}
			SomePlugin.pluginName = 'foo/bar';

			availablePlugins.push( SomePlugin );

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [ SomePlugin ] )
				.then( () => {
					expect( plugins.get( 'foo/bar' ) ).toBeInstanceOf( SomePlugin );
					expect( plugins.get( SomePlugin ) ).toBeInstanceOf( SomePlugin );
				} );
		} );

		it( 'throws if plugin cannot be retrieved by name', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( 'foo' ),
					/^plugincollection-plugin-not-loaded/, editor, { plugin: 'foo' }
				);
			} );
		} );

		it( 'throws if plugin cannot be retrieved by class', () => {
			class SomePlugin extends Plugin {}
			SomePlugin.pluginName = 'foo';

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( SomePlugin ),
					/^plugincollection-plugin-not-loaded/, editor, { plugin: 'foo' } );
			} );
		} );

		it( 'throws if plugin cannot be retrieved by class (class name in error)', () => {
			class SomePlugin extends Plugin {}

			const plugins = new PluginCollection( editor, availablePlugins );

			return plugins.init( [] ).then( () => {
				expectToThrowCKEditorError( () => plugins.get( SomePlugin ),
					/^plugincollection-plugin-not-loaded/,
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
			expect( plugins.has( 'foobar' ) ).toBe( false );
		} );

		it( 'returns false if plugins is not loaded (retrieved by class)', () => {
			class SomePlugin extends Plugin {
			}

			expect( plugins.has( SomePlugin ) ).toBe( false );
		} );

		it( 'returns true if plugins is loaded (retrieved by name)', () => {
			return plugins.init( [ PluginA ] ).then( () => {
				expect( plugins.has( 'A' ) ).toBe( true );
			} );
		} );

		it( 'returns true if plugins is loaded (retrieved by class)', () => {
			return plugins.init( [ PluginA ] ).then( () => {
				expect( plugins.has( PluginA ) ).toBe( true );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'calls Plugin#destroy() method on every loaded plugin', () => {
			let destroySpyForPluginA, destroySpyForPluginB;

			const plugins = new PluginCollection( editor, [] );

			return plugins.init( [ PluginA, PluginB ] )
				.then( () => {
					destroySpyForPluginA = vi.spyOn( plugins.get( PluginA ), 'destroy' );
					destroySpyForPluginB = vi.spyOn( plugins.get( PluginB ), 'destroy' );

					return plugins.destroy();
				} )
				.then( () => {
					expect( destroySpyForPluginA ).toHaveBeenCalledOnce();
					expect( destroySpyForPluginB ).toHaveBeenCalledOnce();
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
					expect( destroyedPlugins ).toContain( 'AsynchronousPluginB.destroy()' );
					expect( destroyedPlugins ).toContain( 'AsynchronousPluginA.destroy()' );
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
					expect( destroyedPlugins.length ).toBe( 1 );
				} );
		} );
	} );

	describe( 'iterator', () => {
		it( 'exists', () => {
			const plugins = new PluginCollection( editor, availablePlugins );

			expect( plugins[ Symbol.iterator ] ).toBeDefined();
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

					expect( pluginConstructors ).toEqual( expect.arrayContaining( [ SomePlugin1, SomePlugin2 ] ) );
					expect( pluginConstructors.length ).toBe( 2 );
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
	return addSpy.mock.calls
		.map( arg => arg[ 0 ] )
		// Entries may be kept twice in the plugins map - once as a pluginName => plugin, once as pluginClass => plugin.
		// Return only pluginClass => plugin entries as these will always represent all plugins.
		.filter( plugin => typeof plugin == 'function' );
}

function getPluginNames( plugins ) {
	return plugins.map( plugin => plugin.pluginName );
}
