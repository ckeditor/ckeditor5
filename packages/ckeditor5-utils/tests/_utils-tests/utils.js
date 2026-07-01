/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ObservableMixin } from '../../src/observablemixin.js';
import { EmitterMixin } from '../../src/emittermixin.js';
import { createObserver } from '../_utils/utils.js';

describe( 'utils - testUtils', () => {
	const Observable = ObservableMixin();
	const Emitter = EmitterMixin();

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'createObserver()', () => {
		let observable, observable2, observer;

		beforeEach( () => {
			observer = createObserver();

			observable = new Observable();
			observable.set( { foo: 0, bar: 0 } );

			observable2 = new Observable();
			observable2.set( { foo: 0, bar: 0 } );
		} );

		it( 'should create an observer', () => {
			expect( observer ).toBeInstanceOf( Emitter );
			expect( observer.observe ).toBeTypeOf( 'function' );
			expect( observer.stopListening ).toBeTypeOf( 'function' );
		} );

		describe( 'Observer', () => {
			it( 'logs changes in the observable', () => {
				const spy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );

				observer.observe( 'Some observable', observable );
				observer.observe( 'Some observable 2', observable2 );

				observable.foo = 1;
				expect( spy ).toHaveBeenCalledTimes( 1 );

				observable.foo = 2;
				observable2.bar = 3;
				expect( spy ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'logs changes to specified properties', () => {
				const spy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );

				observer.observe( 'Some observable', observable, [ 'foo' ] );

				observable.foo = 1;
				expect( spy ).toHaveBeenCalledTimes( 1 );

				observable.bar = 1;
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'stops listening when asked to do so', () => {
				const spy = vi.spyOn( console, 'log' ).mockImplementation( () => {} );

				observer.observe( 'Some observable', observable );

				observable.foo = 1;
				expect( spy ).toHaveBeenCalledTimes( 1 );

				observer.stopListening();

				observable.foo = 2;
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );
} );
