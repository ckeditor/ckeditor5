/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Context from '../src/context';
import ContextPlugin from '../src/contextplugin';
import Plugin from '../src/plugin';
import Config from '@ckeditor/ckeditor5-utils/src/config';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import VirtualTestEditor from './_utils/virtualtesteditor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	} );

	describe( 'getConfigForEditor()', () => {
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

			expect( context.getConfigForEditor() ).to.be.deep.equal( {
				language: { ui: 'pl', content: 'ar' },
				foo: 1,
				bar: 'bom'
			} );
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
				.match( /^context-initplugins-invalid-plugin: Only plugin marked as a ContextPlugin is allowed./ );
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
				.match( /^context-initplugins-invalid-plugin: Only plugin marked as a ContextPlugin is allowed./ );
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
				.match( /^context-initplugins-constructor-only: Only constructor is allowed as a Context plugin./ );
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
	} );
} );
