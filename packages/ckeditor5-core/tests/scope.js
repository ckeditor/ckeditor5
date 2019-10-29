/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Scope from '../src/scope';
import Plugin from '../src/plugin';
import VirtualTestEditor from './_utils/virtualtesteditor';

describe( 'Scope', () => {
	it( 'should share the same instance of plugin within editors using scope', async () => {
		class ScopePluginA extends Plugin {}
		class ScopePluginB extends Plugin {}
		class EditorPluginA extends Plugin {}

		const scope = await Scope.create( { plugins: [ ScopePluginA, ScopePluginB ] } );
		const editorA = await VirtualTestEditor.create( { scope, plugins: [ ScopePluginA, EditorPluginA ] } );
		const editorB = await VirtualTestEditor.create( { scope, plugins: [ ScopePluginB, EditorPluginA ] } );

		expect( editorA.plugins.get( ScopePluginA ) ).to.equal( scope.plugins.get( ScopePluginA ) );
		expect( editorA.plugins.has( ScopePluginB ) ).to.equal( false );
		expect( editorB.plugins.get( ScopePluginB ) ).to.equal( scope.plugins.get( ScopePluginB ) );
		expect( editorB.plugins.has( ScopePluginA ) ).to.equal( false );

		expect( scope.plugins.has( EditorPluginA ) ).to.equal( false );
		expect( editorA.plugins.get( EditorPluginA ) ).to.not.equal( editorB.plugins.get( EditorPluginA ) );

		await scope.destroy();
	} );

	it( 'should share the same instance of plugin within editors using scope (deeps)', async () => {
		class ScopePluginA extends Plugin {}
		class ScopePluginB extends Plugin {}
		class EditorPluginA extends Plugin {
			static get requires() {
				return [ ScopePluginA ];
			}
		}
		class EditorPluginB extends Plugin {
			static get requires() {
				return [ ScopePluginB ];
			}
		}

		const scope = await Scope.create( { plugins: [ ScopePluginA, ScopePluginB ] } );
		const editorA = await VirtualTestEditor.create( { scope, plugins: [ EditorPluginA ] } );
		const editorB = await VirtualTestEditor.create( { scope, plugins: [ EditorPluginB ] } );

		expect( scope.plugins.get( ScopePluginA ) ).to.equal( editorA.plugins.get( ScopePluginA ) );
		expect( scope.plugins.get( ScopePluginB ) ).to.equal( editorB.plugins.get( ScopePluginB ) );

		await scope.destroy();
	} );

	it( 'should not initialize twice plugin added to the scope and the editor', async () => {
		const initSpy = sinon.spy();
		const afterInitSpy = sinon.spy();

		class ScopePluginA extends Plugin {
			init() {
				initSpy();
			}

			afterInit() {
				afterInitSpy();
			}
		}

		const scope = await Scope.create( { plugins: [ ScopePluginA ] } );
		const editor = await VirtualTestEditor.create( { scope, plugins: [ ScopePluginA ] } );

		expect( scope.plugins.get( ScopePluginA ) ).to.equal( editor.plugins.get( ScopePluginA ) );
		sinon.assert.calledOnce( initSpy );
		sinon.assert.calledOnce( afterInitSpy );

		await scope.destroy();
	} );

	it( 'should not destroy scope plugin when only the editor is destroyed', async () => {
		const scopePluginDestroySpy = sinon.spy();
		const editorPluginDestroySpy = sinon.spy();

		class ScopePlugin extends Plugin {
			destroy() {
				scopePluginDestroySpy();
			}
		}

		class EditorPlugin extends Plugin {
			destroy() {
				editorPluginDestroySpy();
			}
		}

		const scope = await Scope.create( { plugins: [ ScopePlugin ] } );
		const editor = await VirtualTestEditor.create( { scope, plugins: [ ScopePlugin, EditorPlugin ] } );

		await editor.destroy();

		sinon.assert.calledOnce( editorPluginDestroySpy );
		sinon.assert.notCalled( scopePluginDestroySpy );
	} );

	it( 'should not destroy scope along with editor when scope is injected to the editor', () => {

	} );

	it( 'should destroy all editors along with the scope when scope is injected to them', () => {

	} );

	it( 'should destroy scope along with editor when scope is created by the editor', () => {

	} );
} );
