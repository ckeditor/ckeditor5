/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Context from '../src/context.js';
import ContextPlugin from '../src/contextplugin.js';
import Plugin from '../src/plugin.js';
import ClassicTestEditor from './_utils/classictesteditor.js';
import Config from '@ckeditor/ckeditor5-utils/src/config.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import VirtualTestEditor from './_utils/virtualtesteditor.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

describe( 'Context', () => {
	describe( 'config', () => {
		it( 'should be created', () => {
			const context = new Context();

			expect( context.config ).to.instanceof( Config );
		} );

		it( 'should be with given configuration', () => {
			const context = new Context( { foo: 'bar' } );

			expect( context.config.get( 'foo' ) ).to.equal( 'bar' );
		} );

		it( 'should not set translations in the config', () => {
			const context = new Context( { translations: {
				pl: {
					dictionary: {
						bold: 'Pogrubienie'
					}
				}
			} } );

			expect( context.config.get( 'translations' ) ).to.equal( undefined );
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

			expect( context._getEditorConfig() ).to.be.deep.equal( {
				language: { ui: 'pl', content: 'ar' },
				foo: 1,
				bar: 'bom'
			} );
		} );
	} );

	describe( 'editors', () => {
		it( 'should keep all the editors created within the context and fire event:add whenever an editor is added', async () => {
			const spy = sinon.spy();
			const context = await Context.create();

			context.editors.on( 'add', spy );

			const editorA = await VirtualTestEditor.create( { context } );

			expect( spy.calledOnce );

			const editorB = await VirtualTestEditor.create( { context } );

			expect( spy.calledTwice );

			expect( context.editors.has( editorA ) );
			expect( context.editors.has( editorB ) );
		} );
	} );

	describe( 'locale', () => {
		it( 'is instantiated and t() is exposed', () => {
			const context = new Context();

			expect( context.locale ).to.be.instanceof( Locale );
			expect( context.t ).to.equal( context.locale.t );
		} );

		it( 'is configured with the config.language (UI and the content)', () => {
			const context = new Context( { language: 'pl' } );

			expect( context.locale.uiLanguage ).to.equal( 'pl' );
			expect( context.locale.contentLanguage ).to.equal( 'pl' );
		} );

		it( 'is configured with the config.language (different for UI and the content)', () => {
			const context = new Context( { language: { ui: 'pl', content: 'ar' } } );

			expect( context.locale.uiLanguage ).to.equal( 'pl' );
			expect( context.locale.contentLanguage ).to.equal( 'ar' );
		} );

		it( 'is configured with the config.language (just the content)', () => {
			const context = new Context( { language: { content: 'ar' } } );

			expect( context.locale.uiLanguage ).to.equal( 'en' );
			expect( context.locale.contentLanguage ).to.equal( 'ar' );
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

			expect( context.locale.translations.pl.dictionary.key ).to.equal( '' );
			expect( context.locale.translations.pl.getPluralForm() ).to.equal( '' );
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

			expect( caughtError ).to.instanceof( CKEditorError );
			expect( caughtError.message )
				.match( /^context-initplugins-invalid-plugin/ );
		} );

		it( 'should throw when plugin added to the context is not marked as a ContextPlugin (Function)', async () => {
			function EditorPlugin() {}

			let caughtError;

			try {
				await Context.create( { plugins: [ EditorPlugin ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).to.instanceof( CKEditorError );
			expect( caughtError.message )
				.match( /^context-initplugins-invalid-plugin/ );
		} );

		it( 'should throw when plugin is added to the context by name', async () => {
			let caughtError;

			try {
				await Context.create( { plugins: [ 'ContextPlugin' ] } );
			} catch ( error ) {
				caughtError = error;
			}

			expect( caughtError ).to.instanceof( CKEditorError );
			expect( caughtError.message )
				.match( /^context-initplugins-constructor-only/ );
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

			expect( caughtError ).to.equal( undefined );
		} );

		it( 'should share the same instance of plugin within editors using the same context', async () => {
			class ContextPluginA extends ContextPlugin {}
			class ContextPluginB extends ContextPlugin {}
			class EditorPluginA extends Plugin {}

			const context = await Context.create( { plugins: [ ContextPluginA, ContextPluginB ] } );
			const editorA = await VirtualTestEditor.create( { context, plugins: [ ContextPluginA, EditorPluginA ] } );
			const editorB = await VirtualTestEditor.create( { context, plugins: [ ContextPluginB, EditorPluginA ] } );

			expect( editorA.plugins.get( ContextPluginA ) ).to.equal( context.plugins.get( ContextPluginA ) );
			expect( editorA.plugins.has( ContextPluginB ) ).to.equal( false );
			expect( editorB.plugins.get( ContextPluginB ) ).to.equal( context.plugins.get( ContextPluginB ) );
			expect( editorB.plugins.has( ContextPluginA ) ).to.equal( false );

			expect( context.plugins.has( EditorPluginA ) ).to.equal( false );
			expect( editorA.plugins.get( EditorPluginA ) ).to.not.equal( editorB.plugins.get( EditorPluginA ) );

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

			expect( context.plugins.get( ContextPluginA ) ).to.equal( editorA.plugins.get( ContextPluginA ) );
			expect( context.plugins.get( ContextPluginB ) ).to.equal( editorB.plugins.get( ContextPluginB ) );

			await context.destroy();
		} );

		it( 'should not initialize twice plugin added to the context and the editor', async () => {
			const initSpy = sinon.spy();
			const afterInitSpy = sinon.spy();

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

			expect( context.plugins.get( ContextPluginA ) ).to.equal( editor.plugins.get( ContextPluginA ) );
			sinon.assert.calledOnce( initSpy );
			sinon.assert.calledOnce( afterInitSpy );

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

			expect( editor.plugins.has( ContextPluginA ) ).to.equal( true );
			expect( editor.plugins.has( ContextPluginB ) ).to.equal( false );
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

			expect( context.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( ContextPlugin );
			expect( context.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( NoErrorPlugin );
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
				expect( error ).to.instanceof( CKEditorError );
				expect( error.message ).match( /^context-initplugins-constructor-only/ );
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
				expect( error ).to.instanceof( CKEditorError );
				expect( error.message ).match( /^context-initplugins-invalid-plugin/ );
			}
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy plugins', async () => {
			const context = await Context.create();
			const spy = sinon.spy( context.plugins, 'destroy' );

			await context.destroy();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should destroy all editors with injected context', async () => {
			const context = await Context.create();
			const editorA = await VirtualTestEditor.create( { context } );
			const editorB = await VirtualTestEditor.create( { context } );
			const editorC = await VirtualTestEditor.create();

			sinon.spy( editorA, 'destroy' );
			sinon.spy( editorB, 'destroy' );
			sinon.spy( editorC, 'destroy' );

			await context.destroy();

			sinon.assert.calledOnce( editorA.destroy );
			sinon.assert.calledOnce( editorB.destroy );
			sinon.assert.notCalled( editorC.destroy );
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
					expect( getPlugins( context ).length ).to.equal( 3 );

					expect( context.plugins.get( PluginA ) ).to.be.an.instanceof( ContextPlugin );
					expect( context.plugins.get( PluginB ) ).to.be.an.instanceof( ContextPlugin );
					expect( context.plugins.get( PluginC ) ).to.be.an.instanceof( ContextPlugin );
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
					expect( getPlugins( context ).length ).to.equal( 1 );

					expect( context.plugins.get( PluginA ) ).to.be.an.instanceof( ContextPlugin );
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

			expect( context.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( ContextPlugin );
			expect( context.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( NoErrorPlugin );
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

			expect( context.config.get( 'foo' ) ).to.equal( 4 );
			expect( context.config.get( 'bar' ) ).to.equal( 2 );
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
			expect( editor.config.get( 'translations' ) ).to.equal( undefined );
		} );

		it( 'should properly get translations with the key', () => {
			expect( editor.locale.translations.pl.dictionary.bold ).to.equal( 'Pogrubienie' );
		} );

		it( 'should properly get translations with dot in the key', () => {
			expect( editor.locale.translations.pl.dictionary[ 'a.b' ] ).to.equal( 'value' );
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
			expect( editor.config.get( 'translations' ) ).to.equal( undefined );
		} );

		it( 'should properly get translations with the key', () => {
			expect( editor.locale.translations.pl.dictionary.bold ).to.equal( 'Pogrubienie' );
		} );

		it( 'should properly get translations with dot in the key', () => {
			expect( editor.locale.translations.pl.dictionary[ 'a.b' ] ).to.equal( 'value' );
		} );
	} );
} );

function getPlugins( editor ) {
	return Array.from( editor.plugins )
		.map( entry => entry[ 1 ] ); // Get instances.
}
