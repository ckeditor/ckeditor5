/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { resolveErrorSources } from '../src/resolveerrorsource.js';
import { Context } from '../src/context.js';
import { Plugin } from '../src/plugin.js';
import { ContextPlugin } from '../src/contextplugin.js';
import { VirtualTestEditor } from './_utils/virtualtesteditor.js';

describe( 'resolveErrorSources()', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create();
	} );

	afterEach( async () => {
		if ( editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	describe( 'a context that is the answer itself', () => {
		it( 'should return the editor passed as the context', () => {
			expect( resolveErrorSources( editor ) ).toEqual( [ editor ] );
		} );

		it( 'should return the context passed as the context', async () => {
			const context = await Context.create();

			expect( resolveErrorSources( context ) ).toEqual( [ context ] );

			await context.destroy();
		} );

		// An editor makes a context for itself when it is not given one. Nobody registers that context, and
		// nobody outside holds it, so the answer is the editor it belongs to.
		it( 'should return the editor for a context that editor made for itself', async () => {
			const own = await VirtualTestEditor.create();

			expect( resolveErrorSources( own.config.get( 'context' ) ?? own._context ) ).toEqual( [ own ] );

			await own.destroy();
		} );

		it( 'should return an editor that is not ready, leaving the decision to the caller', () => {
			const notReady = new VirtualTestEditor();

			expect( notReady.state ).to.not.equal( 'ready' );
			expect( resolveErrorSources( notReady ) ).toEqual( [ notReady ] );
		} );
	} );

	describe( 'no answer', () => {
		it( 'should return null for null', () => {
			expect( resolveErrorSources( null ) ).toEqual( [] );
		} );

		it( 'should return null for undefined', () => {
			expect( resolveErrorSources( undefined ) ).toEqual( [] );
		} );

		it( 'should return null for a primitive', () => {
			expect( resolveErrorSources( 'foo' ) ).toEqual( [] );
			expect( resolveErrorSources( 42 ) ).toEqual( [] );
		} );

		it( 'should return null for an object that shares nothing with any editor', () => {
			expect( resolveErrorSources( { foo: 'bar' } ) ).toEqual( [] );
		} );
	} );

	describe( 'a context that belongs to an editor', () => {
		it( 'should return the editor for an object reachable from it', () => {
			expect( resolveErrorSources( editor.model ) ).toEqual( [ editor ] );
			expect( resolveErrorSources( editor.model.document ) ).toEqual( [ editor ] );
			expect( resolveErrorSources( editor.plugins ) ).toEqual( [ editor ] );
		} );

		it( 'should tell two editors apart', async () => {
			const other = await VirtualTestEditor.create();

			expect( resolveErrorSources( editor.model ) ).toEqual( [ editor ] );
			expect( resolveErrorSources( other.model ) ).toEqual( [ other ] );

			await other.destroy();
		} );

		// The configuration keeps arrays by reference, so both editors reach the same one. `second` is the
		// telling case: a single answer would be `first`, which leaves out the editor the object came from.
		it( 'should name every editor that shares an object with the context', async () => {
			const shared = [ 'shared' ];
			const first = await VirtualTestEditor.create( { shared } );
			const second = await VirtualTestEditor.create( { shared } );

			expect( resolveErrorSources( second.config ) ).toEqual( [ first, second ] );

			await first.destroy();
			await second.destroy();
		} );

		it( 'should name every context that shares an object with the context when no editor does', async () => {
			const shared = [ 'shared' ];
			const first = await Context.create( { shared } );
			const second = await Context.create( { shared } );

			expect( resolveErrorSources( second.config ) ).toEqual( [ first, second ] );

			await first.destroy();
			await second.destroy();
		} );
	} );

	describe( 'the list of editors that may be named', () => {
		it( 'should not name an editor that is not ready yet', () => {
			// Not created, so it never became ready and never entered the list. Its model is therefore
			// reachable from nothing the resolver knows about.
			const notReady = new VirtualTestEditor();

			expect( resolveErrorSources( notReady.model ) ).toEqual( [] );
		} );

		it( 'should stop naming an editor once it is destroyed', async () => {
			const model = editor.model;

			expect( resolveErrorSources( model ) ).toEqual( [ editor ] );

			await editor.destroy();

			expect( resolveErrorSources( model ) ).toEqual( [] );
		} );
	} );

	describe( 'editors sharing a context', () => {
		let context, first, second;

		beforeEach( async () => {
			context = await Context.create();

			first = await VirtualTestEditor.create( { context } );
			second = await VirtualTestEditor.create( { context } );
		} );

		afterEach( async () => {
			await first.destroy();
			await second.destroy();
			await context.destroy();
		} );

		// Every editor in a context can be reached from every other one through `context.editors`, so
		// without excluding what the context owns, the first editor asked would answer for all of them.
		// `second` is the telling case, because `first` is asked first.
		it( 'should name the editor the object actually belongs to', () => {
			expect( resolveErrorSources( first.model ) ).toEqual( [ first ] );
			expect( resolveErrorSources( second.model ) ).toEqual( [ second ] );
		} );

		// A model has no way back to its editor, so it never reaches anything the editors have in common.
		// A plugin does, through `plugin.editor`, which makes it the case that catches a shared object being
		// left on the editors themselves — and a plugin is the most common error context there is.
		it( 'should name the editor for a context that can reach it', async () => {
			class Marker extends Plugin {
				static get pluginName() {
					return 'Marker';
				}
			}

			const withPlugin = await VirtualTestEditor.create( { context, plugins: [ Marker ] } );
			const alsoWithPlugin = await VirtualTestEditor.create( { context, plugins: [ Marker ] } );

			expect( resolveErrorSources( withPlugin.plugins.get( Marker ) ) ).toEqual( [ withPlugin ] );
			expect( resolveErrorSources( alsoWithPlugin.plugins.get( Marker ) ) ).toEqual( [ alsoWithPlugin ] );

			expect( resolveErrorSources( withPlugin.commands ) ).toEqual( [ withPlugin ] );
			expect( resolveErrorSources( alsoWithPlugin.commands ) ).toEqual( [ alsoWithPlugin ] );

			await withPlugin.destroy();
			await alsoWithPlugin.destroy();
		} );

		// An error no editor claims belongs to the context. A context plugin is shared by every editor, so it
		// is exactly what produces such an error.
		it( 'should name the context for an object the context itself owns', () => {
			expect( resolveErrorSources( context.plugins ) ).toEqual( [ context ] );
		} );

		it( 'should name the context for a context plugin', async () => {
			class SharedPlugin extends ContextPlugin {
				static get pluginName() {
					return 'SharedPlugin';
				}
			}

			const sharedContext = await Context.create( { plugins: [ SharedPlugin ] } );
			const editorInContext = await VirtualTestEditor.create( { context: sharedContext } );

			expect( resolveErrorSources( sharedContext.plugins.get( SharedPlugin ) ) ).toEqual( [ sharedContext ] );

			// The editor still wins for what belongs to it alone.
			expect( resolveErrorSources( editorInContext.model ) ).toEqual( [ editorInContext ] );

			await editorInContext.destroy();
			await sharedContext.destroy();
		} );

		// Everything in a context is reachable from it, so a context matches an error from any editor inside
		// it. An editor that is not ready cannot answer for itself, and a context has no ready state to
		// filter on — so without care, an error from a starting or tearing-down editor would be reported as
		// the context's. Asking the editors first is what stops that.
		it( 'should not name the context for an error from an editor that is not ready', async () => {
			// Its own context, because `destroy()` on an editor that never became ready waits forever for
			// `ready`, and the shared cleanup would hang on it.
			const ownContext = await Context.create();
			const notReady = new VirtualTestEditor( { context: ownContext } );

			expect( notReady.state ).to.not.equal( 'ready' );
			expect( Array.from( ownContext.editors ) ).toContain( notReady );

			expect( resolveErrorSources( notReady.model ) ).toEqual( [] );

			ownContext.editors.remove( notReady );

			await ownContext.destroy();
		} );

		// `Context.create()` is the way in that the documentation shows, but the constructor is public and a
		// context can be built by hand. Attribution has to know that one too, or the editors sharing it are
		// told apart by nothing and the first one asked answers for all of them.
		it( 'should name the right editor for a context built by hand', async () => {
			const built = new Context();

			await built.initPlugins();

			const one = await VirtualTestEditor.create( { context: built } );
			const other = await VirtualTestEditor.create( { context: built } );

			expect( resolveErrorSources( one.model ) ).toEqual( [ one ] );
			expect( resolveErrorSources( other.model ) ).toEqual( [ other ] );
			expect( resolveErrorSources( built.plugins ) ).toEqual( [ built ] );

			await one.destroy();
			await other.destroy();
			await built.destroy();
		} );

		// The snapshot is taken once. `initPlugins()` is public, and by the time it could be called again the
		// context has editors — taking the snapshot then would pull them in, and every error from any of them
		// would look like the context's own.
		it( 'should keep naming the editor after the plugins are initialized again', async () => {
			expect( resolveErrorSources( first.model ) ).toEqual( [ first ] );

			await context.initPlugins();

			expect( resolveErrorSources( first.model ) ).toEqual( [ first ] );
			expect( resolveErrorSources( second.model ) ).toEqual( [ second ] );
		} );

		// A context built by hand is in the integrator's hands while `initPlugins()` is still pending, so an
		// editor can join it before the snapshot is taken. The editors are excluded from the walk explicitly,
		// so it does not matter whether any had arrived by then.
		it( 'should keep an editor that joined while the plugins were initializing out of the snapshot', async () => {
			let letPluginsFinish;

			class Slow extends ContextPlugin {
				static get pluginName() {
					return 'Slow';
				}

				init() {
					return new Promise( resolve => {
						letPluginsFinish = resolve;
					} );
				}
			}

			const built = new Context( { plugins: [ Slow ] } );
			const initialized = built.initPlugins();
			const early = await VirtualTestEditor.create( { context: built } );

			letPluginsFinish();
			await initialized;

			expect( Array.from( built.editors ) ).toContain( early );
			expect( resolveErrorSources( early.model ) ).toEqual( [ early ] );

			await early.destroy();
			await built.destroy();
		} );

		// The exclusion set reaches an editor through a getter on the prototype rather than a property on
		// the instance. `getSubNodes` walks with `for...in`, which passes over non-enumerable members, so a
		// property would put the same set on every editor in the context — and finding it there would match
		// them all with each other.
		it( 'should keep the exclusion set out of the walk', () => {
			expect( Object.prototype.hasOwnProperty.call( first, '_errorExclusions' ) ).toBe( false );
			expect( first._errorExclusions ).toBe( second._errorExclusions );
		} );

		it( 'should stop naming a context once it is destroyed', async () => {
			const goneContext = await Context.create();
			const plugins = goneContext.plugins;

			expect( resolveErrorSources( plugins ) ).toEqual( [ goneContext ] );

			await goneContext.destroy();

			expect( resolveErrorSources( plugins ) ).toEqual( [] );
		} );
	} );

	describe( 'reading the context off a thrown error', () => {
		it( 'should work for an error thrown with an editor-owned object', () => {
			const error = new CKEditorError( 'test-error', editor.model );

			expect( resolveErrorSources( error.context ) ).toEqual( [ editor ] );
		} );

		it( 'should give no answer for an error thrown with no context', () => {
			const error = new CKEditorError( 'test-error' );

			expect( resolveErrorSources( error.context ) ).toEqual( [] );
		} );
	} );
} );
