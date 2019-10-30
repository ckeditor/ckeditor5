/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Context from '../src/context';
import ContextPlugin from '../src/contextplugin';
import Plugin from '../src/plugin';
import VirtualTestEditor from './_utils/virtualtesteditor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'Context', () => {
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

	it( 'should not destroy context along with the editor when context is injected to the editor', async () => {
		const contextPluginDestroySpy = sinon.spy();
		const editorPluginDestroySpy = sinon.spy();

		class ContextPluginA extends ContextPlugin {
			destroy() {
				contextPluginDestroySpy();
			}
		}

		class EditorPlugin extends Plugin {
			destroy() {
				editorPluginDestroySpy();
			}
		}

		const context = await Context.create( { plugins: [ ContextPluginA ] } );
		const editor = await VirtualTestEditor.create( { context, plugins: [ ContextPluginA, EditorPlugin ] } );

		await editor.destroy();

		sinon.assert.calledOnce( editorPluginDestroySpy );
		sinon.assert.notCalled( contextPluginDestroySpy );
	} );

	it( 'should destroy all editors with injected context when context is destroyed', async () => {
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

	it( 'should throw when plugin is added to the context by name', async () => {
		let caughtError;

		try {
			await Context.create( { plugins: [ 'ContextPlugin' ] } );
		} catch ( error ) {
			caughtError = error;
		}

		expect( caughtError ).to.instanceof( CKEditorError );
		expect( caughtError.message ).match( /^context-initplugins: Only constructor is allowed as a Context plugin./ );
	} );

	it( 'should throw when plugin added to the context is not marked as a ContextPlugin #1', async () => {
		class EditorPlugin extends Plugin {}

		let caughtError;

		try {
			await Context.create( { plugins: [ EditorPlugin ] } );
		} catch ( error ) {
			caughtError = error;
		}

		expect( caughtError ).to.instanceof( CKEditorError );
		expect( caughtError.message ).match( /^context-initplugins: Only plugins marked as a ContextPlugin are allowed./ );
	} );

	it( 'should throw when plugin added to the context is not marked as a ContextPlugin #2', async () => {
		function EditorPlugin() {}

		let caughtError;

		try {
			await Context.create( { plugins: [ EditorPlugin ] } );
		} catch ( error ) {
			caughtError = error;
		}

		expect( caughtError ).to.instanceof( CKEditorError );
		expect( caughtError.message ).match( /^context-initplugins: Only plugins marked as a ContextPlugin are allowed./ );
	} );

	it( 'should not throw when plugin added to the context has not a ContextPlugin proto but is marked as a ContextPlugin', async () => {
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

	it( 'should throw when plugin added to the context is not marked as a ContextPlugin #2', async () => {
		function EditorPlugin() {}

		let caughtError;

		try {
			await Context.create( { plugins: [ EditorPlugin ] } );
		} catch ( error ) {
			caughtError = error;
		}

		expect( caughtError ).to.instanceof( CKEditorError );
		expect( caughtError.message ).match( /^context-initplugins: Only plugins marked as a ContextPlugin are allowed./ );
	} );
} );
