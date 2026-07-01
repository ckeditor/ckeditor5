/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Context } from '../src/context.js';
import { ContextPlugin } from '../src/contextplugin.js';
import { Plugin } from '../src/plugin.js';
import { ClassicTestEditor } from './_utils/classictesteditor.js';
import { Config, Locale, CKEditorError } from '@ckeditor/ckeditor5-utils';
import { VirtualTestEditor } from './_utils/virtualtesteditor.js';

describe( 'Context', () => {
	describe( 'config', () => {
		it( 'should be created', () => {
			const context = new Context();

			expect( context.config ).toBeInstanceOf( Config );
		} );

		it( 'should be with given configuration', () => {
			const context = new Context( { foo: 'bar' } );

			expect( context.config.get( 'foo' ) ).toBe( 'bar' );
		} );

		it( 'should not set translations in the config', () => {
			const context = new Context( { translations: {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				}
			} } );

			expect( context.config.get( 'translations' ) ).toBeUndefined();
		} );
	} );

	describe( '_getEditorConfig()', () => {
		it( 'should return the configuration without plugin config', () => {
			class FooPlugin extends ContextPlugin {}
			class BarPlugin extends ContextPlugin {}
			class BomPlugin extends ContextPlugin {}

			const context = new Context( {
				language: { ui: 'pl', content: 'ar' },
				plugins: [ FooPlugin, BarPlugin ],
				extraPlugins: [ BomPlugin ],
				removePlugins: [ FooPlugin ],
				foo: 1,
				bar: 'bom'
			} );

			expect( context._getEditorConfig() ).toEqual( {
				language: { ui: 'pl', content: 'ar' },
				foo: 1,
				bar: 'bom'
			} );
		} );
	} );

	describe( 'editors', () => {
		it( 'should keep all the editors created within the context and fire event:add whenever an editor is added', async () => {
			const spy = vi.fn();
			const context = await Context.create();

			context.editors.on( 'add', spy );

			const editorA = await VirtualTestEditor.create( { context } );

			expect( spy ).toHaveBeenCalledOnce();

			const editorB = await VirtualTestEditor.create( { context } );

			expect( spy ).toHaveBeenCalledTimes( 2 );

			expect( context.editors.has( editorA ) ).toBe( true );
			expect( context.editors.has( editorB ) ).toBe( true );
		} );
	} );

	describe( 'locale', () => {
		it( 'is instantiated and t() is exposed', () => {
			const context = new Context();

			expect( context.locale ).toBeInstanceOf( Locale );
			expect( context.t ).toBe( context.locale.t );
		} );

		it( 'is configured with the config.language (UI and the content)', () => {
			const context = new Context( { language: 'pl' } );

			expect( context.locale.uiLanguage ).toBe( 'pl' );
			expect( context.locale.contentLanguage ).toBe( 'pl' );
		} );

		it( 'is configured with the config.language (different for UI and the content)', () => {
			const context = new Context( { language: { ui: 'pl', content: 'ar' } } );

			expect( context.locale.uiLanguage ).toBe( 'pl' );
			expect( context.locale.contentLanguage ).toBe( 'ar' );
		} );

		it( 'is configured with the config.language (just the content)', () => {
			const context = new Context( { language: { content: 'ar' } } );

			expect( context.locale.uiLanguage ).toBe( 'en' );
			expect( context.locale.contentLanguage ).toBe( 'ar' );
		} );

		it( 'is configured with the config.translations', () => {
			const context = new Context( {
				translations: {
					pl: {
						dictionary: {
							key: ''
						},
						getPluralForm: () => ''
					} }
			} );

			expect( context.locale.translations.pl.dictionary.key ).toBe( '' );
			expect( context.locale.translations.pl.getPluralForm() ).toBe( '' );
		} );
	} );

	describe( 'plugins', () => {
		it( 'should throw when plugin added to the context is not marked as a ContextPlugin (Plugin)', async () => {
			class EditorPlugin extends Plugin {}

			let caughtError;

			try {
				await Context.create( { plugins: [ EditorPlugin ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).toBeInstanceOf( CKEditorError );
			expect( caughtError.message )
				.toMatch( /^context-initplugins-invalid-plugin/ );
		} );

		it( 'should throw when plugin added to the context is not marked as a ContextPlugin (Function)', async () => {
			function EditorPlugin() {}

			let caughtError;

			try {
				await Context.create( { plugins: [ EditorPlugin ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).toBeInstanceOf( CKEditorError );
			expect( caughtError.message )
				.toMatch( /^context-initplugins-invalid-plugin/ );
		} );

		it( 'should throw when plugin is added to the context by name', async () => {
			let caughtError;

			try {
				await Context.create( { plugins: [ 'ContextPlugin' ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).toBeInstanceOf( CKEditorError );
			expect( caughtError.message )
				.toMatch( /^context-initplugins-constructor-only/ );
		} );

		it( 'should not throw when plugin as a function, marked as a ContextPlugin is added to the context', async () => {
			function EditorPlugin() {}
			EditorPlugin.isContextPlugin = true;

			let caughtError;

			try {
				await Context.create( { plugins: [ EditorPlugin ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).toBeUndefined();
		} );

		it( 'should share the same instance of plugin within editors using the same context', async () => {
			class ContextPluginA extends ContextPlugin {}
			class ContextPluginB extends ContextPlugin {}
			class EditorPluginA extends Plugin {}

			const context = await Context.create( { plugins: [ ContextPluginA, ContextPluginB ] } );
			const editorA = await VirtualTestEditor.create( { context, plugins: [ ContextPluginA, EditorPluginA ] } );
			const editorB = await VirtualTestEditor.create( { context, plugins: [ ContextPluginB, EditorPluginA ] } );

			expect( editorA.plugins.get( ContextPluginA ) ).toBe( context.plugins.get( ContextPluginA ) );
			expect( editorA.plugins.has( ContextPluginB ) ).toBe( false );
			expect( editorB.plugins.get( ContextPluginB ) ).toBe( context.plugins.get( ContextPluginB ) );
			expect( editorB.plugins.has( ContextPluginA ) ).toBe( false );

			expect( context.plugins.has( EditorPluginA ) ).toBe( false );
			expect( editorA.plugins.get( EditorPluginA ) ).not.toBe( editorB.plugins.get( EditorPluginA ) );

			await context.destroy();
		} );

		it( 'should share the same instance of plugin (dependencies) within editors using the same context', async () => {
			class ContextPluginA extends ContextPlugin {}
			class ContextPluginB extends ContextPlugin {}
			class EditorPluginA extends Plugin {
				static get requires() {
					return [ ContextPluginA ];
				}
			}
			class EditorPluginB extends Plugin {
				static get requires() {
					return [ ContextPluginB ];
				}
			}

			const context = await Context.create( { plugins: [ ContextPluginA, ContextPluginB ] } );
			const editorA = await VirtualTestEditor.create( { context, plugins: [ EditorPluginA ] } );
			const editorB = await VirtualTestEditor.create( { context, plugins: [ EditorPluginB ] } );

			expect( context.plugins.get( ContextPluginA ) ).toBe( editorA.plugins.get( ContextPluginA ) );
			expect( context.plugins.get( ContextPluginB ) ).toBe( editorB.plugins.get( ContextPluginB ) );

			await context.destroy();
		} );

		it( 'should not initialize twice plugin added to the context and the editor', async () => {
			const initSpy = vi.fn();
			const afterInitSpy = vi.fn();

			class ContextPluginA extends ContextPlugin {
				init() {
					initSpy();
				}

				afterInit() {
					afterInitSpy();
				}
			}

			const context = await Context.create( { plugins: [ ContextPluginA ] } );
			const editor = await VirtualTestEditor.create( { context, plugins: [ ContextPluginA ] } );

			expect( context.plugins.get( ContextPluginA ) ).toBe( editor.plugins.get( ContextPluginA ) );
			expect( initSpy ).toHaveBeenCalledOnce();
			expect( afterInitSpy ).toHaveBeenCalledOnce();

			await context.destroy();
		} );

		it( 'should be able to add context plugin to the editor using pluginName property', async () => {
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

			const context = await Context.create( { plugins: [ ContextPluginB ] } );
			const editor = await VirtualTestEditor.create( { context, plugins: [ 'ContextPluginA' ] } );

			expect( editor.plugins.has( ContextPluginA ) ).toBe( true );
			expect( editor.plugins.has( ContextPluginB ) ).toBe( false );
		} );

		it( 'should allow substituting a plugin specified as "config.plugins"', async () => {
			class ErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					throw new Error( 'Ooops.' );
				}
			}

			class NoErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					return Promise.resolve();
				}
			}

			const context = await Context.create( {
				plugins: [ ErrorPlugin ],
				substitutePlugins: [ NoErrorPlugin ]
			} );

			expect( context.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( ContextPlugin );
			expect( context.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( NoErrorPlugin );
		} );

		it( 'should throw an error if specified an invalid type of a plugin for substituting', async () => {
			class ErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					throw new Error( 'Ooops.' );
				}
			}

			try {
				await Context.create( {
					plugins: [ ErrorPlugin ],
					substitutePlugins: [ 'NoErrorPlugin' ]
				} );
			} catch ( error ) {
				expect( error ).toBeInstanceOf( CKEditorError );
				expect( error.message ).toMatch( /^context-initplugins-constructor-only/ );
			}
		} );

		it( 'should throw an error if a plugin for substituting does not extend the ContextPlugin class', async () => {
			class ErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					throw new Error( 'Ooops.' );
				}
			}

			class NoErrorPlugin extends Plugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					throw new Error( 'Ooops.' );
				}
			}

			try {
				await Context.create( {
					plugins: [ ErrorPlugin ],
					substitutePlugins: [ NoErrorPlugin ]
				} );
			} catch ( error ) {
				expect( error ).toBeInstanceOf( CKEditorError );
				expect( error.message ).toMatch( /^context-initplugins-invalid-plugin/ );
			}
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy plugins', async () => {
			const context = await Context.create();
			const spy = vi.spyOn( context.plugins, 'destroy' );

			await context.destroy();

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should destroy all editors with injected context', async () => {
			const context = await Context.create();
			const editorA = await VirtualTestEditor.create( { context } );
			const editorB = await VirtualTestEditor.create( { context } );
			const editorC = await VirtualTestEditor.create();

			vi.spyOn( editorA, 'destroy' );
			vi.spyOn( editorB, 'destroy' );
			vi.spyOn( editorC, 'destroy' );

			await context.destroy();

			expect( editorA.destroy ).toHaveBeenCalledOnce();
			expect( editorB.destroy ).toHaveBeenCalledOnce();
			expect( editorC.destroy ).not.toHaveBeenCalled();
		} );

		it( 'should not crash when destroyed for the second time', async () => {
			const context = await Context.create();

			await VirtualTestEditor.create( { context } );
			await context.destroy();
			await context.destroy();
		} );

		it( 'should not crash when destroyed for the second time - editor own managed context', async () => {
			const editor = await VirtualTestEditor.create();

			await editor.destroy();
			await editor.destroy();
		} );
	} );

	describe( 'builtinPlugins', () => {
		class PluginA extends ContextPlugin {}
		class PluginB extends ContextPlugin {}
		class PluginC extends ContextPlugin {}

		beforeEach( () => {
			Context.builtinPlugins = [ PluginA, PluginB, PluginC ];
		} );

		afterEach( () => {
			delete Context.builtinPlugins;
		} );

		it( 'should load plugins built in the Context even if the passed config is empty', () => {
			const context = new Context();

			return context.initPlugins()
				.then( () => {
					expect( getPlugins( context ).length ).toBe( 3 );

					expect( context.plugins.get( PluginA ) ).toBeInstanceOf( ContextPlugin );
					expect( context.plugins.get( PluginB ) ).toBeInstanceOf( ContextPlugin );
					expect( context.plugins.get( PluginC ) ).toBeInstanceOf( ContextPlugin );
				} );
		} );

		it( 'should load plugins provided in the config and should ignore plugins built in the Editor', () => {
			const context = new Context( {
				plugins: [
					PluginA
				]
			} );

			return context.initPlugins()
				.then( () => {
					expect( getPlugins( context ).length ).toBe( 1 );

					expect( context.plugins.get( PluginA ) ).toBeInstanceOf( ContextPlugin );
				} );
		} );

		it( 'should allow substituting a plugin built in the context', async () => {
			class ErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					throw new Error( 'Ooops.' );
				}
			}

			class NoErrorPlugin extends ContextPlugin {
				static get pluginName() {
					return 'FooPlugin';
				}

				init() {
					return Promise.resolve();
				}
			}

			class CustomContext extends Context {}

			CustomContext.builtinPlugins = [ ErrorPlugin ];

			const context = await CustomContext.create( {
				substitutePlugins: [ NoErrorPlugin ]
			} );

			expect( context.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( ContextPlugin );
			expect( context.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( NoErrorPlugin );
		} );
	} );

	describe( 'defaultConfig', () => {
		beforeEach( () => {
			Context.defaultConfig = { foo: 1, bar: 2 };
		} );

		afterEach( () => {
			delete Context.defaultConfig;
		} );

		it( 'should extend an editor configuration using built in config', () => {
			const context = new Context( {
				foo: 4
			} );

			expect( context.config.get( 'foo' ) ).toBe( 4 );
			expect( context.config.get( 'bar' ) ).toBe( 2 );
		} );
	} );

	describe( 'config.translations', () => {
		let editor, element;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					translations: {
						pl: {
							dictionary: {
								bold: 'Pogrubienie',
								'a.b': 'value'
							}
						}
					}
				} )
				.then( _editor => {
					editor = _editor;
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should not set translations in the config', () => {
			expect( editor.config.get( 'translations' ) ).toBeUndefined();
		} );

		it( 'should properly get translations with the key', () => {
			expect( editor.locale.translations.pl.dictionary.bold ).toBe( 'Pogrubienie' );
		} );

		it( 'should properly get translations with dot in the key', () => {
			expect( editor.locale.translations.pl.dictionary[ 'a.b' ] ).toBe( 'value' );
		} );
	} );

	describe( 'defaultConfig.translations', () => {
		let editor, element;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			class TestEditor extends ClassicTestEditor {}

			TestEditor.defaultConfig = {
				translations: {
					pl: {
						dictionary: {
							bold: 'Pogrubienie',
							'a.b': 'value'
						}
					}
				}
			};

			return TestEditor
				.create( element )
				.then( _editor => {
					editor = _editor;
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should not set translations in the config', () => {
			expect( editor.config.get( 'translations' ) ).toBeUndefined();
		} );

		it( 'should properly get translations with the key', () => {
			expect( editor.locale.translations.pl.dictionary.bold ).toBe( 'Pogrubienie' );
		} );

		it( 'should properly get translations with dot in the key', () => {
			expect( editor.locale.translations.pl.dictionary[ 'a.b' ] ).toBe( 'value' );
		} );
	} );
} );

function getPlugins( editor ) {
	return Array.from( editor.plugins )
		.map( entry => entry[ 1 ] ); // Get instances.
}
