/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay } from '../src/delay.js';

describe( 'utils', () => {
	describe( 'delay', () => {
		beforeEach( () => {
			vi.useFakeTimers();
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'should create a function', () => {
			const callback = () => {};
			const delayed = delay( callback, 100 );

			expect( typeof delayed ).toBe( 'function' );
		} );

		it( 'should create a function that triggers callback after a delay', () => {
			const spy = vi.fn();
			const delayed = delay( spy, 100 );

			expect( spy ).not.toHaveBeenCalled();
			delayed();

			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 90 );
			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 10 );
			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should pass arguments to the callback', () => {
			const spy = vi.fn();
			const delayed = delay( spy, 100 );

			expect( spy ).not.toHaveBeenCalled();
			delayed( 'foo', 123 );

			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 100 );
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( 'foo', 123 );
		} );

		it( 'should be cancellable', () => {
			const spy = vi.fn();
			const delayed = delay( spy, 100 );

			expect( spy ).not.toHaveBeenCalled();
			delayed();

			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 80 );
			expect( spy ).not.toHaveBeenCalled();
			delayed.cancel();
			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 100 );
			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should reset time counting on next call', () => {
			const spy = vi.fn();
			const delayed = delay( spy, 100 );

			expect( spy ).not.toHaveBeenCalled();
			delayed( 'first' );

			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 80 );
			expect( spy ).not.toHaveBeenCalled();

			delayed( 'second' );
			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 50 );
			expect( spy ).not.toHaveBeenCalled();
			vi.advanceTimersByTime( 50 );
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy ).toHaveBeenCalledWith( 'second' );
		} );
	} );
} );
