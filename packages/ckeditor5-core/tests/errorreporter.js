/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, onTestFinished } from 'vitest';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import { onEditorError } from '../src/errorreporter.js';
import { Editor } from '../src/editor/editor.js';
import { Context } from '../src/context.js';
import { VirtualTestEditor } from './_utils/virtualtesteditor.js';
import { stubWindowOnError } from './_utils/stubwindowonerror.js';

describe( 'onEditorError()', () => {
	let editor, unsubscribes;

	beforeEach( async () => {
		stubWindowOnError();

		editor = await VirtualTestEditor.create();
		unsubscribes = [];
	} );

	afterEach( async () => {
		// The reporter is page-level state, so every registration has to go or it leaks into the next test.
		unsubscribes.forEach( off => off() );

		if ( editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	function register( callback ) {
		const off = onEditorError( callback );

		unsubscribes.push( off );

		return off;
	}

	// Thrown for real, from a timeout, so that the browser raises an uncaught error and the reporter is
	// reached the same way it is in production. Returns the error so tests can assert identity.
	function throwUncaught( context, name = 'test-error' ) {
		const error = new CKEditorError( name, context );

		setTimeout( () => {
			throw error;
		} );

		return error;
	}

	function waitCycle() {
		return new Promise( resolve => setTimeout( resolve ) );
	}

	describe( 'reporting', () => {
		it( 'should report an error that escaped, with its source', async () => {
			const callback = vi.fn();

			register( callback );

			const error = throwUncaught( editor.model );

			await waitCycle();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( { error, source: editor } );
		} );

		it( 'should report an error carried by an unhandled rejection', async () => {
			const callback = vi.fn();

			register( callback );

			const error = new CKEditorError( 'test-error', editor.model );

			// No `catch()`, so this becomes an unhandled rejection.
			Promise.reject( error );

			await waitCycle();
			await waitCycle();
			await waitCycle();

			expect( callback ).toHaveBeenCalledTimes( 1 );
			expect( callback ).toHaveBeenCalledWith( { error, source: editor } );
		} );

		it( 'should report an error thrown with the editor itself as the context', async () => {
			const callback = vi.fn();

			register( callback );

			const error = throwUncaught( editor );

			await waitCycle();

			expect( callback ).toHaveBeenCalledWith( { error, source: editor } );
		} );

		it( 'should report the same error once, even when it arrives through both channels', async () => {
			const callback = vi.fn();

			register( callback );

			const error = new CKEditorError( 'test-error', editor.model );

			setTimeout( () => {
				throw error;
			} );
			Promise.reject( error );

			await waitCycle();
			await waitCycle();

			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should report an error thrown with a context', async () => {
			const callback = vi.fn();
			const context = await Context.create();

			onTestFinished( () => context.destroy() );

			register( callback );

			throwUncaught( context );

			await waitCycle();

			expect( callback ).toHaveBeenCalledWith( expect.objectContaining( { source: context } ) );
		} );
	} );

	describe( 'errors that are not reported', () => {
		it( 'should ignore an error that is not a CKEditorError', async () => {
			const callback = vi.fn();

			register( callback );

			// Opt out of the CKEditorError-only swallowing, because this one is deliberate.
			stubWindowOnError( { swallowAllErrors: true } );

			setTimeout( () => {
				throw new TypeError( 'foo' );
			} );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore a rejection whose reason is not an error at all', async () => {
			const callback = vi.fn();

			register( callback );

			Promise.reject( 'just a string' );

			await waitCycle();
			await waitCycle();
			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore an error whose source cannot be named', async () => {
			const callback = vi.fn();

			register( callback );

			throwUncaught( { foo: 'bar' } );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore an error thrown with a null context', async () => {
			const callback = vi.fn();

			register( callback );

			throwUncaught( null );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore an error thrown with no context at all', async () => {
			const callback = vi.fn();

			register( callback );

			setTimeout( () => {
				throw new CKEditorError( 'test-error' );
			} );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore an error from an editor that is not ready yet', async () => {
			const callback = vi.fn();

			register( callback );

			throwUncaught( new VirtualTestEditor() );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		// An editor on its way out is filtered by its lifecycle state. A context has none, so what stands in
		// for it is whether attribution still knows about it. Without this, the same error would be dropped
		// when it reached us through the context's plugins and reported when the context was passed directly.
		it( 'should ignore an error from a context that is already destroyed', async () => {
			const callback = vi.fn();
			const context = await Context.create();

			await context.destroy();

			register( callback );

			throwUncaught( context );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should ignore an error from an editor that is already destroyed', async () => {
			const callback = vi.fn();

			register( callback );

			await editor.destroy();

			throwUncaught( editor );

			await waitCycle();

			expect( callback ).not.toHaveBeenCalled();
		} );
	} );

	// A framework integration is handed an editor or a context class and cannot import from CKEditor:
	// importing anything as a value loads the npm build, and an application that meant to load CKEditor
	// from a CDN is then refused. So the same function has to be reachable off the class.
	describe( 'reachable from the classes', () => {
		it( 'should be the same function on Editor as the exported one', () => {
			expect( Editor.onEditorError ).toBe( onEditorError );
		} );

		it( 'should be the same function on Context', () => {
			expect( Context.onEditorError ).toBe( onEditorError );
		} );

		it( 'should be inherited by an editor class', () => {
			expect( VirtualTestEditor.onEditorError ).toBe( onEditorError );
		} );

		it( 'should register through the class and unregister the same way', async () => {
			const callback = vi.fn();

			unsubscribes.push( VirtualTestEditor.onEditorError( callback ) );

			throwUncaught( editor.model );

			await waitCycle();

			expect( callback ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'registering and unregistering', () => {
		it( 'should call every registered callback', async () => {
			const first = vi.fn();
			const second = vi.fn();

			register( first );
			register( second );

			throwUncaught( editor.model );

			await waitCycle();

			expect( first ).toHaveBeenCalledTimes( 1 );
			expect( second ).toHaveBeenCalledTimes( 1 );
		} );

		// There is deliberately no test that throws with every registration removed. With no `error`
		// listener left, the test runner's own error tracker stops muting itself and reports the throw as
		// an unhandled error. The two tests below cover both halves of that case anyway: one proves an
		// unregistered callback stops being called, the other proves the listeners are actually removed.
		it( 'should unregister only its own registration', async () => {
			const first = vi.fn();
			const second = vi.fn();

			const off = register( first );

			register( second );
			off();

			throwUncaught( editor.model );

			await waitCycle();

			expect( first ).not.toHaveBeenCalled();
			expect( second ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should treat the same callback registered twice as two registrations', async () => {
			const callback = vi.fn();

			const off = register( callback );

			register( callback );

			throwUncaught( editor.model, 'test-error-a' );

			await waitCycle();

			expect( callback ).toHaveBeenCalledTimes( 2 );

			// Removing one registration must leave the other one in place.
			off();
			callback.mockClear();

			throwUncaught( editor.model, 'test-error-b' );

			await waitCycle();

			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should be safe to unregister from inside a callback', async () => {
			const second = vi.fn();

			const off = register( () => off() );

			register( second );

			throwUncaught( editor.model );

			await waitCycle();

			expect( second ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should remove the window listeners once the last registration goes', () => {
			const spy = vi.spyOn( window, 'removeEventListener' );

			const off = register( () => {} );

			off();

			const events = spy.mock.calls.map( call => call[ 0 ] );

			expect( events ).toContain( 'error' );
			expect( events ).toContain( 'unhandledrejection' );
		} );
	} );

	describe( 'a callback that throws', () => {
		it( 'should not stop the other callbacks, and should report the broken one', async () => {
			const consoleSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
			const second = vi.fn();

			register( () => {
				throw new Error( 'broken callback' );
			} );
			register( second );

			throwUncaught( editor.model );

			await waitCycle();

			expect( second ).toHaveBeenCalledTimes( 1 );
			expect( consoleSpy ).toHaveBeenCalled();
		} );
	} );
} );
