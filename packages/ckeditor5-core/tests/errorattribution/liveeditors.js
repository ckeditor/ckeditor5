/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';

import {
	_addLiveEditor, _removeLiveEditor, _getLiveEditors,
	_addLiveContext, _removeLiveContext, _isLiveContext
} from '../../src/errorattribution/liveeditors.js';

describe( 'live editors', () => {
	it( 'should list an editor that was added, and stop listing it once removed', () => {
		const editor = {};

		_addLiveEditor( editor );

		expect( Array.from( _getLiveEditors() ) ).toContain( editor );

		_removeLiveEditor( editor );

		expect( Array.from( _getLiveEditors() ) ).not.toContain( editor );
	} );

	it( 'should not mind being asked to remove an editor it does not know', () => {
		expect( () => _removeLiveEditor( {} ) ).not.toThrow();
	} );

	// Editors are held weakly, so one the integrator dropped without destroying can be collected. Garbage
	// collection cannot be triggered on demand, so the reference is faked to reach the same state.
	//
	// It reads as collected once and then comes back, which nothing in reality does. That is what makes the
	// difference between dropping the reference and merely stepping over it observable: skipping alone would
	// leave it in place to be read again.
	it( 'should drop the reference of a collected editor rather than step over it', () => {
		const editor = {};
		let collected = true;

		vi.stubGlobal( 'WeakRef', class {
			deref() {
				const value = collected ? undefined : editor;

				collected = false;

				return value;
			}
		} );

		_addLiveEditor( editor );

		// Nothing behind the reference, so nothing to list.
		expect( Array.from( _getLiveEditors() ) ).not.toContain( editor );

		// And the reference is gone, so the editor it would now resolve to is not listed either.
		expect( Array.from( _getLiveEditors() ) ).not.toContain( editor );
	} );

	describe( 'contexts', () => {
		it( 'should recognise a context it was given, and only that one', () => {
			const context = {};
			const another = {};

			_addLiveContext( context );

			expect( _isLiveContext( context ) ).toBe( true );

			// The list is not empty, so this asks the question that matters: a live context that is not the
			// one being asked about must not answer for it.
			expect( _isLiveContext( another ) ).toBe( false );

			_removeLiveContext( context );

			expect( _isLiveContext( context ) ).toBe( false );
		} );

		it( 'should not mind being asked to remove a context it does not know', () => {
			expect( () => _removeLiveContext( {} ) ).not.toThrow();
		} );

		// `initPlugins()` registers the context and is public, so it can be called again. A second
		// registration would survive the single removal on destroy, and a destroyed context would keep
		// being named.
		it( 'should register a context once, however many times it is added', () => {
			const context = {};

			_addLiveContext( context );
			_addLiveContext( context );

			_removeLiveContext( context );

			expect( _isLiveContext( context ) ).toBe( false );
		} );

		it( 'should not recognise a context that has been collected', () => {
			const context = {};

			vi.stubGlobal( 'WeakRef', class {
				deref() {
					return undefined;
				}
			} );

			_addLiveContext( context );

			expect( _isLiveContext( context ) ).toBe( false );
		} );
	} );
} );
