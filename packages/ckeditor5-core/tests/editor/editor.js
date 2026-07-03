/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Editor } from '../../src/editor/editor.js';
import { Context } from '../../src/context.js';
import { Plugin } from '../../src/plugin.js';
import { Config, Locale, CKEditorError } from '@ckeditor/ckeditor5-utils';
import { EditingController, _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { PluginCollection } from '../../src/plugincollection.js';
import { CommandCollection } from '../../src/commandcollection.js';
import { Command } from '../../src/command.js';
import { EditingKeystrokeHandler } from '../../src/editingkeystrokehandler.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { Accessibility } from '../../src/accessibility.js';
import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';

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
		this.init = vi.fn();
		this.afterInit = vi.fn();
	}

	static get pluginName() {
		return 'A';
	}
}

class PluginB extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = vi.fn();
		this.afterInit = vi.fn();
	}

	static get pluginName() {
		return 'B';
	}
}

class PluginC extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = vi.fn();
		this.afterInit = vi.fn();
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
		this.init = vi.fn();
		this.afterInit = vi.fn();
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
		this.init = vi.fn();
	}

	static get pluginName() {
		return 'E';
	}
}

class PluginF {
	constructor( editor ) {
		this.editor = editor;
		this.afterInit = vi.fn();
	}

	static get pluginName() {
		return 'F';
	}
}

describe( 'Editor', () => {
	afterEach( () => {
		delete TestEditor.builtinPlugins;
		delete TestEditor.defaultConfig;
	} );

	it( 'imports the version helper', () => {
		expect( typeof window.CKEDITOR_VERSION ).toBe( 'string' );
	} );

	describe( 'constructor()', () => {
		it( 'should create a new editor instance', () => {
			const editor = new TestEditor();

			expect( editor.accessibility ).toBeInstanceOf( Accessibility );
			expect( editor.config ).toBeInstanceOf( Config );
			expect( editor.commands ).toBeInstanceOf( CommandCollection );
			expect( editor.editing ).toBeInstanceOf( EditingController );
			expect( editor.keystrokes ).toBeInstanceOf( EditingKeystrokeHandler );

			expect( editor.plugins ).toBeInstanceOf( PluginCollection );
			expect( getPlugins( editor ) ).toHaveLength( 0 );

			expect( editor.model._config ).toBe( editor.config );
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

			expect( editor.config.get( 'foo' ) ).toEqual( {
				a: 1,
				b: 2,
				c: 3
			} );

			expect( editor.config.get( 'bar' ) ).toBe( 'foo' );
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

			expect( editor.config.get( 'translations' ) ).toBeUndefined();
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

			expect( editor.config.get( 'translations' ) ).toBeUndefined();
		} );

		it( 'should bind editing.view.document#isReadOnly to the editor#isReadOnly', () => {
			const editor = new TestEditor();

			expect( editor.editing.view.document.isReadOnly ).toBe( false );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( editor.editing.view.document.isReadOnly ).toBe( true );

			editor.disableReadOnlyMode( 'unit-test' );

			expect( editor.editing.view.document.isReadOnly ).toBe( false );
		} );

		it( 'should activate #keystrokes', () => {
			const spy = vi.spyOn( EditingKeystrokeHandler.prototype, 'listenTo' );
			const editor = new TestEditor();

			expect( spy ).toHaveBeenCalledWith( editor.editing.view.document );
		} );

		it( 'should throw if `config.sanitizeHtml` is passed', () => {
			expectToThrowCKEditorError( () => {
				// eslint-disable-next-line no-new
				new TestEditor( { sanitizeHtml: () => {} } );
			}, 'editor-config-sanitizehtml-not-supported' );
		} );

		it( 'should throw if `config` is not a plain object', () => {
			const testData = [ 7, 'abc', [ 1, 2 ], () => 42, true ];

			for ( const config of testData ) {
				expectToThrowCKEditorError( () => {
					// eslint-disable-next-line no-new
					new TestEditor( config );
				}, 'editor-config-invalid-type' );
			}
		} );
	} );

	describe( 'context integration', () => {
		it( 'should create a new context when it is not provided through config', () => {
			const editor = new TestEditor();

			expect( editor._context ).toBeInstanceOf( Context );
		} );

		it( 'should use context given through config', async () => {
			const context = await Context.create();
			const editor = new TestEditor( { context } );

			expect( editor._context ).toBe( context );
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
			const editorPluginsDestroySpy = vi.spyOn( editor.plugins, 'destroy' );
			const contextDestroySpy = vi.spyOn( editor._context, 'destroy' );

			await editor.destroy();

			expect( contextDestroySpy ).toHaveBeenCalledOnce();
			expect( editorPluginsDestroySpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( contextDestroySpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should not destroy context along with the editor when context was injected to the editor', async () => {
			const context = await Context.create();
			const editor = await TestEditor.create( { context } );
			const contextDestroySpy = vi.spyOn( editor._context, 'destroy' );

			await editor.destroy();

			expect( contextDestroySpy ).not.toHaveBeenCalled();
		} );

		it( 'should add context plugins to the editor plugins', async () => {
			class ContextPlugin {
				static get isContextPlugin() {
					return true;
				}
			}

			const context = await Context.create( { plugins: [ ContextPlugin ] } );
			const editor = new TestEditor( { context } );

			expect( editor.plugins._contextPlugins.has( ContextPlugin ) ).toBe( true );
		} );

		it( 'should get configuration from the context', async () => {
			const context = await Context.create( { cfoo: 'bar' } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'cfoo' ) ).toBe( 'bar' );
		} );

		it( 'should not overwrite the default configuration', async () => {
			const context = await Context.create( { cfoo: 'bar' } );
			const editor = await TestEditor.create( { context, 'cfoo': 'bom' } );

			expect( editor.config.get( 'cfoo' ) ).toBe( 'bom' );
		} );

		it( 'should not copy plugins configuration', async () => {
			class ContextPlugin {
				static get isContextPlugin() {
					return true;
				}
			}

			const context = await Context.create( { plugins: [ ContextPlugin ] } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'plugins' ) ).toHaveLength( 0 );
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

			expect( editor.config.get( 'plugins' ) ).toEqual( [ PluginA ] );
			expect( editor.config.get( 'plugins' ) ).not.toBe( TestEditor.builtinPlugins );
		} );

		it( 'should pass DOM element using reference, not copy', async () => {
			const element = document.createElement( 'div' );
			const context = await Context.create( { efoo: element } );
			const editor = await TestEditor.create( { context } );

			expect( editor.config.get( 'efoo' ) ).toBe( element );
		} );
	} );

	describe( 'plugins', () => {
		it( 'should be empty on new editor', () => {
			const editor = new TestEditor();

			expect( getPlugins( editor ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'locale', () => {
		it( 'should use Context#locale and Context#t', () => {
			const editor = new TestEditor();

			expect( editor.locale ).toBe( editor._context.locale );
			expect( editor.locale ).toBeInstanceOf( Locale );
			expect( editor.t ).toBe( editor._context.t );
		} );

		it( 'should use locale instance with a proper configuration passed as the argument to the constructor', () => {
			const editor = new TestEditor( {
				language: 'pl'
			} );

			expect( editor.locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( editor.locale ).toHaveProperty( 'contentLanguage', 'pl' );
		} );

		it( 'should use locale instance with a proper configuration set as the defaultConfig option on the constructor', () => {
			TestEditor.defaultConfig = {
				language: 'pl'
			};

			const editor = new TestEditor();

			expect( editor.locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( editor.locale ).toHaveProperty( 'contentLanguage', 'pl' );
		} );

		it( 'should prefer the language passed as the argument to the constructor instead of the defaultConfig if both are set', () => {
			TestEditor.defaultConfig = {
				language: 'de'
			};

			const editor = new TestEditor( {
				language: 'pl'
			} );

			expect( editor.locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( editor.locale ).toHaveProperty( 'contentLanguage', 'pl' );
		} );

		it( 'should prefer the language from the context instead of the constructor config or defaultConfig if all are set', async () => {
			TestEditor.defaultConfig = {
				language: 'de'
			};

			const context = await Context.create( { language: 'pl' } );
			const editor = new TestEditor( { context, language: 'ru' } );

			expect( editor.locale ).toHaveProperty( 'uiLanguage', 'pl' );
			expect( editor.locale ).toHaveProperty( 'contentLanguage', 'pl' );
		} );
	} );

	describe( 'state', () => {
		it( 'is `initializing` initially', () => {
			const editor = new TestEditor();

			expect( editor.state ).toBe( 'initializing' );
		} );

		it( 'is `ready` after initialization chain', () => {
			return TestEditor.create().then( editor => {
				expect( editor.state ).toBe( 'ready' );

				return editor.destroy();
			} );
		} );

		it( 'is `destroyed` after editor destroy', () => {
			return TestEditor.create().then( editor => {
				return editor.destroy().then( () => {
					expect( editor.state ).toBe( 'destroyed' );
				} );
			} );
		} );

		it( 'is observable', () => {
			const editor = new TestEditor();
			const spy = vi.fn();

			editor.on( 'change:state', spy );

			editor.state = 'ready';

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'reacts on #ready event', () => {
			const editor = new TestEditor();

			expect( editor.state ).toBe( 'initializing' );

			return new Promise( resolve => {
				editor.on( 'ready', () => {
					expect( editor.state ).toBe( 'ready' );
					resolve();
				} );

				editor.fire( 'ready' );
			} );
		} );

		it( 'reacts on #destroy event', () => {
			const editor = new TestEditor();

			expect( editor.state ).toBe( 'initializing' );

			return new Promise( resolve => {
				editor.on( 'destroy', () => {
					expect( editor.state ).toBe( 'destroyed' );
					resolve();
				} );

				editor.fire( 'destroy' );
			} );
		} );
	} );

	describe( 'read-only state', () => {
		it( 'should be set to false initially', () => {
			const editor = new TestEditor();

			expect( editor.isReadOnly ).toBe( false );
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

			expect( editor.isReadOnly ).toBe( true );

			editor.disableReadOnlyMode( 'lock-2' );

			expect( editor.isReadOnly ).toBe( false );

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

			expect( editor.isReadOnly ).toBe( true );

			editor.disableReadOnlyMode( s2 );

			expect( editor.isReadOnly ).toBe( false );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		// The `change:isReadOnly` event is fired manually and this test ensures
		// the behavior is the same as when the `isReadOnly` would be a normal observable prop.
		it( 'should be observable', async () => {
			const editor = new TestEditor();
			const spy = vi.fn();

			editor.on( 'change:isReadOnly', spy );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( spy ).toHaveBeenCalledOnce();

			expect( spy.mock.calls[ 0 ].slice( 1 ) ).toEqual( [
				'isReadOnly',
				true,
				false
			] );

			editor.disableReadOnlyMode( 'unit-test' );

			expect( spy ).toHaveBeenCalledTimes( 2 );

			expect( spy.mock.calls[ 1 ].slice( 1 ) ).toEqual( [
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

			expect( customPlugin.isEditorReadOnly ).toBe( true );

			editor.disableReadOnlyMode( 'unit-test' );

			expect( customPlugin.isEditorReadOnly ).toBe( false );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'setting read-only lock twice should not throw an error for the same lock ID', async () => {
			const editor = new TestEditor();

			editor.enableReadOnlyMode( 'lock' );
			editor.enableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).toBe( true );

			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).toBe( false );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'clearing read-only lock should not throw an error if the lock ID is not present', async () => {
			const editor = new TestEditor();

			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).toBe( false );

			editor.enableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).toBe( true );

			editor.disableReadOnlyMode( 'lock' );
			editor.disableReadOnlyMode( 'lock' );

			expect( editor.isReadOnly ).toBe( false );

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

			expect( editor ).toHaveProperty( 'conversion' );

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
			} ).not.toThrow();

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should fire "destroy"', () => {
			return TestEditor.create().then( editor => {
				const spy = vi.fn();

				editor.on( 'destroy', spy );

				return editor.destroy().then( () => {
					expect( spy ).toHaveBeenCalledOnce();
				} );
			} );
		} );

		it( 'should destroy all components it initialized', () => {
			return TestEditor.create().then( editor => {
				const dataDestroySpy = vi.spyOn( editor.data, 'destroy' );
				const modelDestroySpy = vi.spyOn( editor.model, 'destroy' );
				const editingDestroySpy = vi.spyOn( editor.editing, 'destroy' );
				const pluginsDestroySpy = vi.spyOn( editor.plugins, 'destroy' );
				const keystrokesDestroySpy = vi.spyOn( editor.keystrokes, 'destroy' );

				return editor.destroy()
					.then( () => {
						expect( dataDestroySpy ).toHaveBeenCalledOnce();
						expect( modelDestroySpy ).toHaveBeenCalledOnce();
						expect( editingDestroySpy ).toHaveBeenCalledOnce();
						expect( pluginsDestroySpy ).toHaveBeenCalledOnce();
						expect( keystrokesDestroySpy ).toHaveBeenCalledOnce();
					} );
			} );
		} );

		it( 'should wait for the full init before destroying', () => {
			const spy = vi.fn();
			const editor = new TestEditor();

			editor.on( 'destroy', () => {
				spy();
			} );

			const destroyPromise = editor.destroy();

			return new Promise( resolve => {
				setTimeout( () => {
					expect( spy ).not.toHaveBeenCalled();
					editor.fire( 'ready' );
					destroyPromise.then( resolve );
				} );
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
			vi.spyOn( command, 'execute' );

			editor.commands.add( 'someCommand', command );
			editor.execute( 'someCommand' );

			expect( command.execute ).toHaveBeenCalledOnce();

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
			vi.spyOn( command, 'execute' ).mockReturnValue( commandResult );

			editor.commands.add( 'someCommand', command );

			const editorResult = editor.execute( 'someCommand' );

			expect( editorResult ).toBe( commandResult );
			expect( editorResult ).toEqual( { foo: 'bar' } );

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
			} ).toThrow( TypeError );
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
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

			editor.editing.view.document.isFocused = true;
			editor.focus();

			expect( focusSpy ).toHaveBeenCalledOnce();

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'create()', () => {
		it( 'should throw when called on the base Editor class directly', () => {
			expect( () => Editor.create() ).toThrow( 'This is an abstract method.' );
		} );

		it( 'should return a promise that resolves properly', async () => {
			const promise = TestEditor.create();

			expect( promise ).toBeInstanceOf( Promise );

			await promise.then( editor => editor.destroy() );
		} );

		it( 'loads plugins', () => {
			return TestEditor.create( { plugins: [ PluginA ] } )
				.then( editor => {
					expect( getPlugins( editor ).length ).toBe( 1 );

					expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );

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
					expect( fired ).toEqual( [ 'ready' ] );

					return editor.destroy();
				} );
		} );
	} );

	describe( 'initPlugins()', () => {
		it( 'should load plugins', () => {
			const editor = new TestEditor( {
				plugins: [ PluginA, PluginB ]
			} );

			expect( getPlugins( editor ) ).toHaveLength( 0 );

			return editor.initPlugins().then( () => {
				expect( getPlugins( editor ).length ).toBe( 2 );

				expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );
				expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );

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
					const pluginAInit = editor.plugins.get( PluginA ).init;
					const pluginBInit = editor.plugins.get( PluginB ).init;
					const pluginCInit = editor.plugins.get( PluginC ).init;
					const pluginDInit = editor.plugins.get( PluginD ).init;
					const pluginAAfterInit = editor.plugins.get( PluginA ).afterInit;
					const pluginBAfterInit = editor.plugins.get( PluginB ).afterInit;
					const pluginCAfterInit = editor.plugins.get( PluginC ).afterInit;
					const pluginDAfterInit = editor.plugins.get( PluginD ).afterInit;

					expect( pluginAInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginBInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginBInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginCInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginCInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginDInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginDInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginAAfterInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginAAfterInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginBAfterInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginBAfterInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginCAfterInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginCAfterInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginDAfterInit.mock.invocationCallOrder[ 0 ] );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous init()', () => {
			const asyncSpy = vi.fn();

			// Synchronous plugin that depends on an asynchronous one.
			class PluginSync extends Plugin {
				constructor( editor ) {
					super( editor );
					this.init = vi.fn();
				}

				static get requires() {
					return [ PluginAsync ];
				}
			}

			class PluginAsync extends Plugin {
				constructor( editor ) {
					super( editor );

					this.init = vi.fn( () => {
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
					const pluginAInit = editor.plugins.get( PluginA ).init;
					const pluginAsyncInit = editor.plugins.get( PluginAsync ).init;
					const pluginSyncInit = editor.plugins.get( PluginSync ).init;

					expect( pluginAInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginAsyncInit.mock.invocationCallOrder[ 0 ] );
					expect( asyncSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginSyncInit.mock.invocationCallOrder[ 0 ] );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous afterInit()', () => {
			const asyncSpy = vi.fn();

			// Synchronous plugin that depends on an asynchronous one.
			class PluginSync extends Plugin {
				constructor( editor ) {
					super( editor );
					this.afterInit = vi.fn();
				}

				static get requires() {
					return [ PluginAsync ];
				}
			}

			class PluginAsync extends Plugin {
				constructor( editor ) {
					super( editor );

					this.afterInit = vi.fn( () => {
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
					const pluginAAfterInit = editor.plugins.get( PluginA ).afterInit;
					const pluginAsyncAfterInit = editor.plugins.get( PluginAsync ).afterInit;
					const pluginSyncAfterInit = editor.plugins.get( PluginSync ).afterInit;

					expect( pluginAAfterInit.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( pluginAsyncAfterInit.mock.invocationCallOrder[ 0 ] );
					expect( asyncSpy.mock.invocationCallOrder[ 0 ] )
						.toBeLessThan( pluginSyncAfterInit.mock.invocationCallOrder[ 0 ] );

					editor.fire( 'ready' );
					return editor.destroy();
				} );
		} );

		it( 'should load plugins built in the Editor even if the passed config is empty', () => {
			TestEditor.builtinPlugins = [ PluginA, PluginB, PluginC ];

			const editor = new TestEditor();

			return editor.initPlugins()
				.then( () => {
					expect( getPlugins( editor ).length ).toBe( 3 );

					expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginC ) ).toBeInstanceOf( Plugin );

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
					expect( getPlugins( editor ).length ).toBe( 1 );

					expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );

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
					expect( getPlugins( editor ).length ).toBe( 4 );

					expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginC ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PrivatePlugin ) ).toBeInstanceOf( PrivatePlugin );

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
					expect( getPlugins( editor ).length ).toBe( 3 );

					expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginC ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginD ) ).toBeInstanceOf( Plugin );

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
					expect( getPlugins( editor ).length ).toBe( 3 );

					expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginC ) ).toBeInstanceOf( Plugin );
					expect( editor.plugins.get( PluginD ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( PluginA ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( PluginA ) ).not.toBeUndefined();

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
						expect( getPlugins( editor ).length ).toBe( 3 );
						expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 2 );
						expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 2 );
						expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 2 );
						expect( editor.plugins.get( PluginB ) ).toBeInstanceOf( Plugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( NoErrorPlugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( NoErrorPlugin );

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
						expect( getPlugins( editor ).length ).toBe( 1 );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( Plugin );
						expect( editor.plugins.get( 'FooPlugin' ) ).toBeInstanceOf( NoErrorPlugin );

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
					const pluginAInit = editor.plugins.get( PluginA ).init;
					const pluginEInit = editor.plugins.get( PluginE ).init;
					const pluginAAfterInit = editor.plugins.get( PluginA ).afterInit;

					expect( pluginAInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginEInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginEInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginAAfterInit.mock.invocationCallOrder[ 0 ] );

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
					const pluginAInit = editor.plugins.get( PluginA ).init;
					const pluginAAfterInit = editor.plugins.get( PluginA ).afterInit;
					const pluginFAfterInit = editor.plugins.get( PluginF ).afterInit;

					expect( pluginAInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginAAfterInit.mock.invocationCallOrder[ 0 ] );
					expect( pluginAAfterInit.mock.invocationCallOrder[ 0 ] ).toBeLessThan( pluginFAfterInit.mock.invocationCallOrder[ 0 ] );

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
			editor.fire( 'ready' ); // (https://github.com/ckeditor/ckeditor5/issues/6139)
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'setData()', () => {
			it( 'should be added to editor interface', () => {
				expect( editor ).toHaveProperty( 'setData' );
				expect( typeof editor.setData ).toBe( 'function' );
			} );

			it( 'should set data of the first root', () => {
				editor.setData( 'foo' );

				expect( _getModelData( editor.model, { rootName: 'main', withoutSelection: true } ) ).toBe( 'foo' );
			} );
		} );

		describe( 'getData()', () => {
			it( 'should be added to editor interface', () => {
				expect( editor ).toHaveProperty( 'getData' );
				expect( typeof editor.getData ).toBe( 'function' );
			} );

			it( 'should get data of the first root', () => {
				_setModelData( editor.model, 'foo' );

				expect( editor.getData() ).toBe( 'foo' );
			} );

			it( 'should get data of the second root', () => {
				_setModelData( editor.model, 'bar', { rootName: 'secondRoot' } );

				expect( editor.getData( { rootName: 'secondRoot' } ) ).toBe( 'bar' );
			} );

			it( 'should pass options object to data.get() method internally', () => {
				const spy = vi.spyOn( editor.data, 'get' );
				const options = { rootName: 'main', trim: 'none' };

				_setModelData( editor.model, 'foo' );

				expect( editor.getData( options ) ).toBe( 'foo' );

				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( options );
			} );
		} );
	} );

	describe( 'registerRootAttribute', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await TestEditor.create();
			model = editor.editing.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should extend root schema with allowed attribute', () => {
			expect( model.schema.checkAttribute( '$root', 'foo' ) ).toBe( false );

			editor.registerRootAttribute( 'foo' );

			expect( model.schema.checkAttribute( '$root', 'foo' ) ).toBe( true );
		} );

		it( 'should not crash if registered the same attribute twice', () => {
			expect( model.schema.checkAttribute( '$root', 'bar' ) ).toBe( false );

			editor.registerRootAttribute( 'bar' );
			editor.registerRootAttribute( 'bar' );

			expect( model.schema.checkAttribute( '$root', 'bar' ) ).toBe( true );
		} );
	} );

	describe( 'getRootAttributes', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await TestEditor.create();
			model = editor.editing.model;
			model.document.createRoot( '$root', 'main' );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not crash if there are no attributes registered', () => {
			expect( editor.getRootAttributes() ).toEqual( {} );
		} );

		it( 'should throw exception when accessing non existing root', () => {
			expectToThrowCKEditorError( () => {
				editor.getRootAttributes( 'unknown' );
			}, 'get-root-attributes-missing-root', editor, { rootName: 'unknown' } );
		} );

		it( 'should return attributes registered using #registerRootAttribute', () => {
			const root = model.document.getRoot();

			model.schema.extend( '$root', { allowAttributes: [ 'bar' ] } );
			model.change( writer => {
				writer.setAttribute( 'bar', 1, root );
			} );

			expect( root.getAttribute( 'bar' ) ).toBe( 1 );
			expect( editor.getRootAttributes() ).toEqual( {} );

			editor.registerRootAttribute( 'bar' );

			expect( editor.getRootAttributes() ).toEqual( {
				bar: 1
			} );
		} );

		it( 'should return `null` if registered attribute is not present on the root', () => {
			expect( editor.getRootAttributes() ).toEqual( {} );

			editor.registerRootAttribute( 'bar' );

			expect( editor.getRootAttributes() ).toEqual( {
				bar: null
			} );
		} );

		it( 'should be possible to specify different root name in first parameter', () => {
			editor.registerRootAttribute( 'bar' );

			model.document.createRoot( '$root', 'second' );
			model.change( writer => {
				writer.setAttribute( 'bar', 1, model.document.getRoot( 'second' ) );
			} );

			expect( editor.getRootAttributes() ).toEqual( {
				bar: null
			} );

			expect( editor.getRootAttributes( 'second' ) ).toEqual( {
				bar: 1
			} );
		} );
	} );

	describe( 'static fields', () => {
		it( 'Editor.Context', () => {
			expect( Editor.Context ).toBe( Context );
		} );

		it( 'Editor.EditorWatchdog', () => {
			expect( Editor.EditorWatchdog ).toBe( EditorWatchdog );
		} );

		it( 'Editor.ContextWatchdog', () => {
			expect( Editor.ContextWatchdog ).toBe( ContextWatchdog );
		} );
	} );
} );

function getPlugins( editor ) {
	return Array.from( editor.plugins )
		.map( entry => entry[ 1 ] ); // Get instances.
}
