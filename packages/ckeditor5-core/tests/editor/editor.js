/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '../../src/editor/editor.js';
import Context from '../../src/context.js';
import Plugin from '../../src/plugin.js';
import Config from '@ckeditor/ckeditor5-utils/src/config.js';
import EditingController from '@ckeditor/ckeditor5-engine/src/controller/editingcontroller.js';
import PluginCollection from '../../src/plugincollection.js';
import CommandCollection from '../../src/commandcollection.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import Command from '../../src/command.js';
import EditingKeystrokeHandler from '../../src/editingkeystrokehandler.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import testUtils from '../../tests/_utils/utils.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Accessibility from '../../src/accessibility.js';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog.js';

class TestEditor extends Editor {
	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

class PluginA extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'A' );
		this.afterInit = sinon.spy().named( 'A-after' );
	}

	static get pluginName() {
		return 'A';
	}
}

class PluginB extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'B' );
		this.afterInit = sinon.spy().named( 'B-after' );
	}

	static get pluginName() {
		return 'B';
	}
}

class PluginC extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'C' );
		this.afterInit = sinon.spy().named( 'C-after' );
	}

	static get pluginName() {
		return 'C';
	}

	static get requires() {
		return [ PluginB ];
	}
}

class PluginD extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'D' );
		this.afterInit = sinon.spy().named( 'D-after' );
	}

	static get pluginName() {
		return 'D';
	}

	static get requires() {
		return [ PluginC ];
	}
}

class PluginE {
	constructor( editor ) {
		this.editor = editor;
		this.init = sinon.spy().named( 'E' );
	}

	static get pluginName() {
		return 'E';
	}
}

class PluginF {
	constructor( editor ) {
		this.editor = editor;
		this.afterInit = sinon.spy().named( 'F-after' );
	}

	static get pluginName() {
		return 'F';
	}
}

describe( 'Editor', () => {
	afterEach( () => {
		delete TestEditor.builtinPlugins;
		delete TestEditor.defaultConfig;

		sinon.restore();
	} );

	it( 'imports the version helper', () => {
		expect( window.CKEDITOR_VERSION ).to.be.a( 'string' );
	} );

	describe( 'constructor()', () => {
		it( 'should create a new editor instance', () => {
			const editor = new TestEditor();

			expect( editor.accessibility ).to.be.an.instanceof( Accessibility );
			expect( editor.config ).to.be.an.instanceof( Config );
			expect( editor.commands ).to.be.an.instanceof( CommandCollection );
			expect( editor.editing ).to.be.instanceof( EditingController );
			expect( editor.keystrokes ).to.be.instanceof( EditingKeystrokeHandler );

			expect( editor.plugins ).to.be.an.instanceof( PluginCollection );
			expect( getPlugins( editor ) ).to.be.empty;
		} );

		it( 'should extend an editor configuration using built in config', () => {
			Editor.defaultConfig = {
				foo: {
					a: 1,
					b: 2
				}
			};

			const editor = new TestEditor( {
				bar: 'foo',
				foo: {
					c: 3
				}
			} );

			expect( editor.config.get( 'foo' ) ).to.deep.equal( {
				a: 1,
				b: 2,
				c: 3
			} );

			expect( editor.config.get( 'bar' ) ).to.equal( 'foo' );
		} );

		it( 'should not have access to translations', () => {
			const editor = new TestEditor( {
				translations: {
					pl: {
						dictionary: {
							Bold: 'Pogrubienie'
						}
					}
				}
			} );

			expect( editor.config.get( 'translations' ) ).to.equal( undefined );
		} );

		it( 'should use translations set as the defaultConfig option on the constructor', () => {
			TestEditor.defaultConfig = {
				translations: {
					pl: {
						dictionary: {
							Bold: 'Pogrubienie'
						}
					}
				}
			};

			const editor = new TestEditor();

			expect( editor.config.get( 'translations' ) ).to.equal( undefined );
		} );

		it( 'should bind editing.view.document#isReadOnly to the editor#isReadOnly', () => {
			const editor = new TestEditor();

			expect( editor.editing.view.document.isReadOnly ).to.false;

			editor.enableReadOnlyMode( 'unit-test' );

			expect( editor.editing.view.document.isReadOnly ).to.true;

			editor.disableReadOnlyMode( 'unit-test' );

			expect( editor.editing.view.document.isReadOnly ).to.false;
		} );

		it( 'should activate #keystrokes', () => {
			const spy = sinon.spy( EditingKeystrokeHandler.prototype, 'listenTo' );
			const editor = new TestEditor();

			sinon.assert.calledWith( spy, editor.editing.view.document );
		} );

		it( 'should throw if `config.sanitizeHtml` is passed', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new TestEditor( { sanitizeHtml: () => {} } );
			}, 'editor-config-sanitizehtml-not-supported' );
		} );
	} );

	describe( 'context integration', () => {
		it( 'should create a new context when it is not provided through config', () => {
			const editor = new TestEditor();

			expect( editor._context ).to.be.an.instanceof( Context );
		} );

		it( 'should use context given through config', async () => {
			const context = await Context.create();
			const editor = new TestEditor( { context } );

			expect( editor._context ).to.equal( context );
		} );

		it( 'should throw when try to use context created by one editor with the other editor', () => {
			const editor = new TestEditor();

			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new TestEditor( { context: editor._context } );
			}, 'context-addeditor-private-context' );
		} );

		it( 'should destroy context created by the editor at the end of the editor destroy chain', async () => {
			const editor = await TestEditor.create();
			const editorPluginsDestroySpy = sinon.spy( editor.plugins, 'destroy' );
			const contextDestroySpy = sinon.spy( editor._context, 'destroy' );

			await editor.destroy();

			sinon.assert.calledOnce( contextDestroySpy );
			expect( editorPluginsDestroySpy.calledBefore( contextDestroySpy ) ).to.true;
		} );

		it( 'should not destroy context along with the editor when context was injected to the editor', async () => {
			const context = await Context.create();
			const editor = await TestEditor.create( { context } );
			const contextDestroySpy = sinon.spy( editor._context, 'destroy' );

			await editor.destroy();

			sinon.assert.notCalled( contextDestroySpy );
		} );

		it( 'should add context plugins to the editor plugins', async () => {
			class ContextPlugin {
				static get isContextPlugin() {
					return true;
				}
			}

			const context = await Context.create( { plugins: [ ContextPlugin ] } );
			const editor = new TestEditor( { context } );

			expect( editor.plugins._contextPlugins.has( ContextPlugin ) ).to.equal( true );
		} );

		it( 'should get configuration from the context', async () => {
			const context = await Context.create( { cfoo: 'bar' } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'cfoo' ) ).to.equal( 'bar' );
		} );

		it( 'should not overwrite the default configuration', async () => {
			const context = await Context.create( { cfoo: 'bar' } );
			const editor = await TestEditor.create( { context, 'cfoo': 'bom' } );

			expect( editor.config.get( 'cfoo' ) ).to.equal( 'bom' );
		} );

		it( 'should not copy plugins configuration', async () => {
			class ContextPlugin {
				static get isContextPlugin() {
					return true;
				}
			}

			const context = await Context.create( { plugins: [ ContextPlugin ] } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'plugins' ) ).to.be.empty;
		} );

		it( 'should copy builtin plugins', async () => {
			TestEditor.builtinPlugins = [ PluginA ];

			class ContextPlugin {
				static get isContextPlugin() {
					return true;
				}
			}

			const context = await Context.create( { plugins: [ ContextPlugin ] } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'plugins' ) ).to.deep.equal( [ PluginA ] );
			expect( editor.config.get( 'plugins' ) ).to.not.equal( TestEditor.builtinPlugins );
		} );

		it( 'should pass DOM element using reference, not copy', async () => {
			const element = document.createElement( 'div' );
			const context = await Context.create( { efoo: element } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'efoo' ) ).to.equal( element );
		} );
	} );

	describe( 'plugins', () => {
		it( 'should be empty on new editor', () => {
			const editor = new TestEditor();

			expect( getPlugins( editor ) ).to.be.empty;
		} );
	} );

	describe( 'locale', () => {
		it( 'should use Context#locale and Context#t', () => {
			const editor = new TestEditor();

			expect( editor.locale ).to.equal( editor._context.locale ).to.instanceof( Locale );
			expect( editor.t ).to.equal( editor._context.t );
		} );

		it( 'should use locale instance with a proper configuration passed as the argument to the constructor', () => {
			const editor = new TestEditor( {
				language: 'pl'
			} );

			expect( editor.locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( editor.locale ).to.have.property( 'contentLanguage', 'pl' );
		} );

		it( 'should use locale instance with a proper configuration set as the defaultConfig option on the constructor', () => {
			TestEditor.defaultConfig = {
				language: 'pl'
			};

			const editor = new TestEditor();

			expect( editor.locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( editor.locale ).to.have.property( 'contentLanguage', 'pl' );
		} );

		it( 'should prefer the language passed as the argument to the constructor instead of the defaultConfig if both are set', () => {
			TestEditor.defaultConfig = {
				language: 'de'
			};

			const editor = new TestEditor( {
				language: 'pl'
			} );

			expect( editor.locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( editor.locale ).to.have.property( 'contentLanguage', 'pl' );
		} );

		it( 'should prefer the language from the context instead of the constructor config or defaultConfig if all are set', async () => {
			TestEditor.defaultConfig = {
				language: 'de'
			};

			const context = await Context.create( { language: 'pl' } );
			const editor = new TestEditor( { context, language: 'ru' } );

			expect( editor.locale ).to.have.property( 'uiLanguage', 'pl' );
			expect( editor.locale ).to.have.property( 'contentLanguage', 'pl' );
		} );
	} );

	describe( 'state', () => {
		it( 'is `initializing` initially', () => {
			const editor = new TestEditor();

			expect( editor.state ).to.equal( 'initializing' );
		} );

		it( 'is `ready` after initialization chain', () => {
			return TestEditor.create().then( editor => {
				expect( editor.state ).to.equal( 'ready' );

				return editor.destroy();
			} );
		} );

		it( 'is `destroyed` after editor destroy', () => {
			return TestEditor.create().then( editor => {
				return editor.destroy().then( () => {
					expect( editor.state ).to.equal( 'destroyed' );
				} );
			} );
		} );

		it( 'is observable', () => {
			const editor = new TestEditor();
			const spy = sinon.spy();

			editor.on( 'change:state', spy );

			editor.state = 'ready';

			sinon.assert.calledOnce( spy );
		} );

		it( 'reacts on #ready event', done => {
			const editor = new TestEditor();

			expect( editor.state ).to.equal( 'initializing' );

			editor.on( 'ready', () => {
				expect( editor.state ).to.equal( 'ready' );
				done();
			} );

			editor.fire( 'ready' );
		} );

		it( 'reacts on #destroy event', done => {
			const editor = new TestEditor();

			expect( editor.state ).to.equal( 'initializing' );

			editor.on( 'destroy', () => {
				expect( editor.state ).to.equal( 'destroyed' );
				done();
			} );

			editor.fire( 'destroy' );
		} );
	} );

	describe( 'read-only state', () => {
		it( 'should be set to false initially', () => {
			const editor = new TestEditor();

			expect( editor.isReadOnly ).to.be.false;
		} );

		it( 'isReadOnly property should throw an error when set directly', () => {
			const editor = new TestEditor();

			expectToThrowCKEditorError( () => {
				editor.isReadOnly = true;
			}, /editor-isreadonly-has-no-setter/ );
		} );

		it( 'should be set to true when at least one lock is set', async () => {
			const editor = new TestEditor();

			editor.enableReadOnlyMode( 'lock-1' );
			editor.enableReadOnlyMode( 'lock-2' );

			editor.disableReadOnlyMode( 'lock-1' );

			expect( editor.isReadOnly ).to.be.true;

			editor.disableReadOnlyMode( 'lock-2' );

			expect( editor.isReadOnly ).to.be.false;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'should allow using symbols as lock IDs', async () => {
			const editor = new TestEditor();

			const s1 = Symbol( 'lock' );
			const s2 = Symbol( 'lock' );

			editor.enableReadOnlyMode( s1 );
			editor.enableReadOnlyMode( s2 );

			editor.disableReadOnlyMode( s1 );

			expect( editor.isReadOnly ).to.be.true;

			editor.disableReadOnlyMode( s2 );

			expect( editor.isReadOnly ).to.be.false;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		// The `change:isReadOnly` event is fired manually and this test ensures
		// the behavior is the same as when the `isReadOnly` would be a normal observable prop.
		it( 'should be observable', async () => {
			const editor = new TestEditor();
			const spy = sinon.spy();

			editor.on( 'change:isReadOnly', spy );

			editor.enableReadOnlyMode( 'unit-test' );

			sinon.assert.calledOnce( spy );

			expect( spy.firstCall.args.slice( 1 ) ).to.deep.equal( [
				'isReadOnly',
				true,
				false
			] );

			editor.disableReadOnlyMode( 'unit-test' );

			sinon.assert.calledTwice( spy );

			expect( spy.secondCall.args.slice( 1 ) ).to.deep.equal( [
				'isReadOnly',
				false,
				true
			] );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		// The `change:isReadOnly` event is fired manually and this test ensures
		// the behavior is the same as when the `isReadOnly` would be a normal observable prop.
		it( 'should be bindable', async () => {
			class CustomPlugin extends Plugin {}

			const editor = await TestEditor.create( {
				plugins: [ CustomPlugin ]
			} );

			const customPlugin = editor.plugins.get( CustomPlugin );

			customPlugin.bind( 'isEditorReadOnly' ).to( editor, 'isReadOnly' );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( customPlugin.isEditorReadOnly ).to.equal( true );

			editor.disableReadOnlyMode( 'unit-test' );

			expect( customPlugin.isEditorReadOnly ).to.equal( false );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'setting read-only lock twice should not throw an error for the same lock ID', async () => {
			const editor = new TestEditor();

			editor.enableReadOnlyMode( 'lock' );
			editor.enableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).to.be.true;

			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).to.be.false;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'clearing read-only lock should not throw an error if the lock ID is not present', async () => {
			const editor = new TestEditor();

			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).to.be.false;

			editor.enableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).to.be.true;

			editor.disableReadOnlyMode( 'lock' );
			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).to.be.false;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'setting read-only lock should throw an error when the lock ID is not a string', async () => {
			const editor = new TestEditor();

			expectToThrowCKEditorError( () => {
				editor.enableReadOnlyMode();
			}, /editor-read-only-lock-id-invalid/, null, { lockId: undefined } );

			expectToThrowCKEditorError( () => {
				editor.enableReadOnlyMode( 123 );
			}, /editor-read-only-lock-id-invalid/, null, { lockId: 123 } );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'clearing read-only lock should throw an error when the lock ID is not a string', async () => {
			const editor = new TestEditor();

			expectToThrowCKEditorError( () => {
				editor.disableReadOnlyMode();
			}, /editor-read-only-lock-id-invalid/, null, { lockId: undefined } );

			expectToThrowCKEditorError( () => {
				editor.disableReadOnlyMode( 123 );
			}, /editor-read-only-lock-id-invalid/, null, { lockId: 123 } );

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'conversion', () => {
		it( 'should have conversion property', async () => {
			const editor = new TestEditor();

			expect( editor ).to.have.property( 'conversion' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'should have defined default conversion groups', async () => {
			const editor = new TestEditor();

			expect( () => {
				// Would throw if any of this group won't exist.
				editor.conversion.for( 'downcast' );
				editor.conversion.for( 'editingDowncast' );
				editor.conversion.for( 'dataDowncast' );
				editor.conversion.for( 'upcast' );
			} ).not.to.throw();

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should fire "destroy"', () => {
			return TestEditor.create().then( editor => {
				const spy = sinon.spy();

				editor.on( 'destroy', spy );

				return editor.destroy().then( () => {
					expect( spy.calledOnce ).to.be.true;
				} );
			} );
		} );

		it( 'should destroy all components it initialized', () => {
			return TestEditor.create().then( editor => {
				const dataDestroySpy = sinon.spy( editor.data, 'destroy' );
				const modelDestroySpy = sinon.spy( editor.model, 'destroy' );
				const editingDestroySpy = sinon.spy( editor.editing, 'destroy' );
				const pluginsDestroySpy = sinon.spy( editor.plugins, 'destroy' );
				const keystrokesDestroySpy = sinon.spy( editor.keystrokes, 'destroy' );

				return editor.destroy()
					.then( () => {
						sinon.assert.calledOnce( dataDestroySpy );
						sinon.assert.calledOnce( modelDestroySpy );
						sinon.assert.calledOnce( editingDestroySpy );
						sinon.assert.calledOnce( pluginsDestroySpy );
						sinon.assert.calledOnce( keystrokesDestroySpy );
					} );
			} );
		} );

		it( 'should wait for the full init before destroying', done => {
			const spy = sinon.spy();
			const editor = new TestEditor();

			editor.on( 'destroy', () => {
				spy();
			} );

			editor
				.destroy()
				.then( () => {
					done();
				} );

			setTimeout( () => {
				sinon.assert.notCalled( spy );
				editor.fire( 'ready' );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should execute specified command', async () => {
			class SomeCommand extends Command {
				execute() {}
			}

			const editor = new TestEditor();

			const command = new SomeCommand( editor );
			sinon.spy( command, 'execute' );

			editor.commands.add( 'someCommand', command );
			editor.execute( 'someCommand' );

			expect( command.execute.calledOnce ).to.be.true;

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'should return the result of command\'s execute()', async () => {
			class SomeCommand extends Command {
				execute() {}
			}

			const editor = new TestEditor();
			const command = new SomeCommand( editor );

			const commandResult = { foo: 'bar' };
			sinon.stub( command, 'execute' ).returns( commandResult );

			editor.commands.add( 'someCommand', command );

			const editorResult = editor.execute( 'someCommand' );

			expect( editorResult, 'editor.execute()' ).to.equal( commandResult );
			expect( editorResult, 'editor.execute()' ).to.deep.equal( { foo: 'bar' } );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'should throw an error if specified command has not been added', async () => {
			const editor = new TestEditor();

			expectToThrowCKEditorError( () => {
				editor.execute( 'command' );
			}, /^commandcollection-command-not-found/, editor );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it.skip( 'should rethrow native errors as they are in the debug=true mode', () => {
			const editor = new TestEditor();
			const error = new TypeError( 'foo' );

			class SomeCommand extends Command {
				constructor( editor ) {
					super( editor );
					this.isEnabled = true;
				}
				execute() {
					throw error;
				}
			}

			editor.commands.add( 'someCommand', new SomeCommand( editor ) );

			expect( () => {
				editor.execute( 'someCommand' );
			} ).to.throw( TypeError, /foo/ );
		} );

		it( 'should rethrow custom CKEditorError errors', async () => {
			const editor = new TestEditor();

			class SomeCommand extends Command {
				constructor( editor ) {
					super( editor );
					this._isEnabledBasedOnSelection = false;
					this.isEnabled = true;
				}
				execute() {
					throw new CKEditorError( 'foo', editor );
				}
			}

			editor.commands.add( 'someCommand', new SomeCommand( editor ) );

			expectToThrowCKEditorError( () => {
				editor.execute( 'someCommand' );
			}, /foo/, editor );

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'focus()', () => {
		it( 'should call view\'s focus() method', async () => {
			const editor = new TestEditor();
			const focusSpy = sinon.spy( editor.editing.view, 'focus' );

			editor.editing.view.document.isFocused = true;
			editor.focus();

			expect( focusSpy.calledOnce ).to.be.true;

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'create()', () => {
		it( 'should return a promise that resolves properly', async () => {
			const promise = TestEditor.create();

			expect( promise ).to.be.an.instanceof( Promise );

			await promise.then( editor => editor.destroy() );
		} );

		it( 'loads plugins', () => {
			return TestEditor.create( { plugins: [ PluginA ] } )
				.then( editor => {
					expect( getPlugins( editor ).length ).to.equal( 1 );

					expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );

					return editor.destroy();
				} );
		} );

		it( 'fires ready event', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'ready', spy );
				}
			}

			return TestEditor.create( { plugins: [ EventWatcher ] } )
				.then( editor => {
					expect( fired ).to.deep.equal( [ 'ready' ] );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'initPlugins()', () => {
		it( 'should load plugins', () => {
			const editor = new TestEditor( {
				plugins: [ PluginA, PluginB ]
			} );

			expect( getPlugins( editor ) ).to.be.empty;

			return editor.initPlugins().then( () => {
				expect( getPlugins( editor ).length ).to.equal( 2 );

				expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );
				expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );

				editor.fire( 'ready' );
				return editor.destroy();
			} );
		} );

		it( 'should initialize plugins in the right order', () => {
			const editor = new TestEditor( {
				plugins: [ PluginA, PluginD ]
			} );

			return editor.initPlugins()
				.then( () => {
					sinon.assert.callOrder(
						editor.plugins.get( PluginA ).init,
						editor.plugins.get( PluginB ).init,
						editor.plugins.get( PluginC ).init,
						editor.plugins.get( PluginD ).init,
						editor.plugins.get( PluginA ).afterInit,
						editor.plugins.get( PluginB ).afterInit,
						editor.plugins.get( PluginC ).afterInit,
						editor.plugins.get( PluginD ).afterInit
					);

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous init()', () => {
			const asyncSpy = sinon.spy().named( 'async-call-spy' );

			// Synchronous plugin that depends on an asynchronous one.
			class PluginSync extends Plugin {
				constructor( editor ) {
					super( editor );
					this.init = sinon.spy().named( 'sync' );
				}

				static get requires() {
					return [ PluginAsync ];
				}
			}

			class PluginAsync extends Plugin {
				constructor( editor ) {
					super( editor );

					this.init = sinon.spy( () => {
						return new Promise( resolve => {
							setTimeout( () => {
								asyncSpy();
								resolve();
							}, 0 );
						} );
					} );
				}
			}

			const editor = new TestEditor( {
				plugins: [ PluginA, PluginSync ]
			} );

			return editor.initPlugins()
				.then( () => {
					sinon.assert.callOrder(
						editor.plugins.get( PluginA ).init,
						editor.plugins.get( PluginAsync ).init,
						// This one is called with delay by the async init.
						asyncSpy,
						editor.plugins.get( PluginSync ).init
					);

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous afterInit()', () => {
			const asyncSpy = sinon.spy().named( 'async-call-spy' );

			// Synchronous plugin that depends on an asynchronous one.
			class PluginSync extends Plugin {
				constructor( editor ) {
					super( editor );
					this.afterInit = sinon.spy().named( 'sync' );
				}

				static get requires() {
					return [ PluginAsync ];
				}
			}

			class PluginAsync extends Plugin {
				constructor( editor ) {
					super( editor );

					this.afterInit = sinon.spy( () => {
						return new Promise( resolve => {
							setTimeout( () => {
								asyncSpy();
								resolve();
							}, 0 );
						} );
					} );
				}
			}

			const editor = new TestEditor( {
				plugins: [ PluginA, PluginSync ]
			} );

			return editor.initPlugins()
				.then( () => {
					sinon.assert.callOrder(
						editor.plugins.get( PluginA ).afterInit,
						editor.plugins.get( PluginAsync ).afterInit,

						// This one is called with delay by the async init.
						asyncSpy,
						editor.plugins.get( PluginSync ).afterInit
					);

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins built in the Editor even if the passed config is empty', () => {
			TestEditor.builtinPlugins = [ PluginA, PluginB, PluginC ];

			const editor = new TestEditor();

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).to.equal( 3 );

					expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginC ) ).to.be.an.instanceof( Plugin );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins provided in the config and should ignore plugins built in the Editor', () => {
			TestEditor.builtinPlugins = [ PluginA, PluginB, PluginC, PluginD ];

			const editor = new TestEditor( {
				plugins: [
					'A'
				]
			} );

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).to.equal( 1 );

					expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins built in the Editor using their names', () => {
			class PrivatePlugin extends Plugin {}

			TestEditor.builtinPlugins = [ PluginA, PluginB, PluginC, PluginD ];

			const editor = new TestEditor( {
				plugins: [
					'A',
					'B',
					'C',
					PrivatePlugin
				]
			} );

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).to.equal( 4 );

					expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginC ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PrivatePlugin ) ).to.be.an.instanceof( PrivatePlugin );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins inherited from the base Editor', () => {
			TestEditor.builtinPlugins = [ PluginA, PluginB, PluginC, PluginD ];

			class CustomEditor extends TestEditor {}

			const editor = new CustomEditor( {
				plugins: [
					'D'
				]
			} );

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).to.equal( 3 );

					expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginC ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginD ) ).to.be.an.instanceof( Plugin );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins build into Editor\'s subclass', () => {
			class CustomEditor extends TestEditor {}

			CustomEditor.builtinPlugins = [ PluginA, PluginB, PluginC, PluginD ];

			const editor = new CustomEditor( {
				plugins: [
					'D'
				]
			} );

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).to.equal( 3 );

					expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginC ) ).to.be.an.instanceof( Plugin );
					expect( editor.plugins.get( PluginD ) ).to.be.an.instanceof( Plugin );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		describe( '"removePlugins" config', () => {
			it( 'should prevent plugins from being loaded', () => {
				const editor = new TestEditor( {
					plugins: [ PluginA, PluginD ],
					removePlugins: [ PluginD ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should not load plugins built in the Editor', () => {
				TestEditor.builtinPlugins = [ PluginA, PluginD ];

				const editor = new TestEditor( {
					removePlugins: [ 'D' ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should not load plugins build into Editor\'s subclass', () => {
				class CustomEditor extends TestEditor {}

				CustomEditor.builtinPlugins = [ PluginA, PluginD ];

				const editor = new CustomEditor( {
					removePlugins: [ 'D' ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( PluginA ) ).to.not.be.undefined;

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );
		} );

		describe( '"extraPlugins" config', () => {
			it( 'should load additional plugins', () => {
				const editor = new TestEditor( {
					plugins: [ PluginA, PluginC ],
					extraPlugins: [ PluginB ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 3 );
						expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should not duplicate plugins', () => {
				const editor = new TestEditor( {
					plugins: [ PluginA, PluginB ],
					extraPlugins: [ PluginB ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 2 );
						expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should not duplicate plugins built in the Editor', () => {
				TestEditor.builtinPlugins = [ PluginA, PluginB ];

				const editor = new TestEditor( {
					extraPlugins: [ 'B' ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 2 );
						expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should not duplicate plugins build into Editor\'s subclass', () => {
				class CustomEditor extends TestEditor {}

				CustomEditor.builtinPlugins = [ PluginA, PluginB ];

				const editor = new CustomEditor( {
					extraPlugins: [ 'B' ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 2 );
						expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );
		} );

		describe( '"substitutePlugins" config', () => {
			it( 'should substitute a plugin when passed as "config.plugins', () => {
				class ErrorPlugin extends Plugin {
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
						return Promise.resolve();
					}
				}

				const editor = new TestEditor( {
					plugins: [ ErrorPlugin ],
					substitutePlugins: [ NoErrorPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( NoErrorPlugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should substitute a plugin when passed as "config.extraPlugins', () => {
				class ErrorPlugin extends Plugin {
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
						return Promise.resolve();
					}
				}

				const editor = new TestEditor( {
					extraPlugins: [ ErrorPlugin ],
					substitutePlugins: [ NoErrorPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( NoErrorPlugin );

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );

			it( 'should substitute a plugin when it is a built-in plugin in the editor class', () => {
				class ErrorPlugin extends Plugin {
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
						return Promise.resolve();
					}
				}

				const originalBuiltinPlugins = Editor.builtinPlugins;

				Editor.builtinPlugins = [ ErrorPlugin ];

				const editor = new TestEditor( {
					substitutePlugins: [ NoErrorPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( getPlugins( editor ).length ).to.equal( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).to.be.an.instanceof( NoErrorPlugin );

						Editor.builtinPlugins = originalBuiltinPlugins;

						editor.fire( 'ready' );
						return editor.destroy();
					} );
			} );
		} );

		it( 'should not call "afterInit" method if plugin does not have this method', () => {
			const editor = new TestEditor( {
				plugins: [ PluginA, PluginE ]
			} );

			return editor.initPlugins()
				.then( () => {
					sinon.assert.callOrder(
						editor.plugins.get( PluginA ).init,
						editor.plugins.get( PluginE ).init,
						editor.plugins.get( PluginA ).afterInit
					);

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should not call "init" method if plugin does not have this method', () => {
			const editor = new TestEditor( {
				plugins: [ PluginA, PluginF ]
			} );

			return editor.initPlugins()
				.then( () => {
					sinon.assert.callOrder(
						editor.plugins.get( PluginA ).init,
						editor.plugins.get( PluginA ).afterInit,
						editor.plugins.get( PluginF ).afterInit
					);

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );
	} );

	describe( 'data API', () => {
		let editor;

		beforeEach( () => {
			class CustomEditor extends Editor {}

			editor = new CustomEditor();
			editor.model.document.createRoot( '$root', 'main' );
			editor.model.document.createRoot( '$root', 'secondRoot' );
			editor.model.schema.extend( '$text', { allowIn: '$root' } );
			editor.fire( 'ready' ); // (#6139)
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'setData()', () => {
			it( 'should be added to editor interface', () => {
				expect( editor ).have.property( 'setData' ).to.be.a( 'function' );
			} );

			it( 'should set data of the first root', () => {
				editor.setData( 'foo' );

				expect( getData( editor.model, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
			} );
		} );

		describe( 'getData()', () => {
			testUtils.createSinonSandbox();

			it( 'should be added to editor interface', () => {
				expect( editor ).have.property( 'getData' ).to.be.a( 'function' );
			} );

			it( 'should get data of the first root', () => {
				setData( editor.model, 'foo' );

				expect( editor.getData() ).to.equal( 'foo' );
			} );

			it( 'should get data of the second root', () => {
				setData( editor.model, 'bar', { rootName: 'secondRoot' } );

				expect( editor.getData( { rootName: 'secondRoot' } ) ).to.equal( 'bar' );
			} );

			it( 'should pass options object to data.get() method internally', () => {
				const spy = testUtils.sinon.spy( editor.data, 'get' );
				const options = { rootName: 'main', trim: 'none' };

				setData( editor.model, 'foo' );

				expect( editor.getData( options ) ).to.equal( 'foo' );

				testUtils.sinon.assert.calledOnce( spy );
				testUtils.sinon.assert.calledWith( spy, options );
			} );
		} );
	} );

	describe( 'static fields', () => {
		it( 'Editor.Context', () => {
			expect( Editor.Context ).to.equal( Context );
		} );

		it( 'Editor.EditorWatchdog', () => {
			expect( Editor.EditorWatchdog ).to.equal( EditorWatchdog );
		} );

		it( 'Editor.ContextWatchdog', () => {
			expect( Editor.ContextWatchdog ).to.equal( ContextWatchdog );
		} );
	} );
} );

function getPlugins( editor ) {
	return Array.from( editor.plugins )
		.map( entry => entry[ 1 ] ); // Get instances.
}
