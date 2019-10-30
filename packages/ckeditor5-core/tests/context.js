/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Context from '../src/context';
import Plugin from '../src/plugin';
import VirtualTestEditor from './_utils/virtualtesteditor';

describe( 'Context', () => {
	it( 'should share the same instance of plugin within editors using the same context', async () => {
		class ContextPluginA extends Plugin {}
		class ContextPluginB extends Plugin {}
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
		class ContextPluginA extends Plugin {}
		class ContextPluginB extends Plugin {}
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

		class ContextPluginA extends Plugin {
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

	it( 'should not destroy context plugin when only the editor is destroyed', async () => {
		const contextPluginDestroySpy = sinon.spy();
		const editorPluginDestroySpy = sinon.spy();

		class ContextPlugin extends Plugin {
			destroy() {
				contextPluginDestroySpy();
			}
		}

		class EditorPlugin extends Plugin {
			destroy() {
				editorPluginDestroySpy();
			}
		}

		const context = await Context.create( { plugins: [ ContextPlugin ] } );
		const editor = await VirtualTestEditor.create( { context, plugins: [ ContextPlugin, EditorPlugin ] } );

		await editor.destroy();

		sinon.assert.calledOnce( editorPluginDestroySpy );
		sinon.assert.notCalled( contextPluginDestroySpy );
	} );

	it( 'should not destroy context along with editor when context is injected to the editor', () => {

	} );

	it( 'should destroy all editors along with the context when context is injected to them', () => {

	} );

	it( 'should destroy context along with editor when context is created by the editor', () => {

	} );
} );
