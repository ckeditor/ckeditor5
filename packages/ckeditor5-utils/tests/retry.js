/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retry, exponentialDelay } from '../src/retry.js';

describe( 'utils', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	} );

	describe( 'retry', () => {
		it( 'returns success the first time', async () => {
			const callback = vi.fn().mockResolvedValue( 'success' );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 3
			} );

			const result = await promise;

			expect( result ).toBe( 'success' );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'returns success the third time', async () => {
			const callback = vi.fn()
				.mockRejectedValueOnce( new Error( '1st failure' ) )
				.mockRejectedValueOnce( new Error( '2nd failure' ) )
				.mockResolvedValueOnce( 'success' );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 6
			} );

			await vi.advanceTimersByTimeAsync( 100 );

			const result = await promise;

			expect( result ).toBe( 'success' );
			expect( callback ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should return failure after `maxAttempts`', async () => {
			const callback = vi.fn()
				.mockRejectedValueOnce( new Error( '1st failure' ) )
				.mockRejectedValueOnce( new Error( '2nd failure' ) )
				.mockRejectedValueOnce( new Error( '3rd failure' ) )
				.mockResolvedValueOnce( 'success' );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 3
			} );
			const resultPromise = promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			await vi.advanceTimersByTimeAsync( 100 );

			const result = await resultPromise;

			expect( result ).toBeInstanceOf( Error );
			expect( result.message ).toBe( '3rd failure' );
			expect( callback ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should return failure after 4 retries by default', async () => {
			const callback = vi.fn()
				.mockRejectedValueOnce( new Error( '1st failure' ) )
				.mockRejectedValueOnce( new Error( '2nd failure' ) )
				.mockRejectedValueOnce( new Error( '3rd failure' ) )
				.mockRejectedValueOnce( new Error( '4rd failure' ) )
				.mockResolvedValueOnce( 'success' );

			const promise = retry( callback, {
				retryDelay: () => 10
			} );
			const resultPromise = promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			await vi.advanceTimersByTimeAsync( 100 );

			const result = await resultPromise;

			expect( result ).toBeInstanceOf( Error );
			expect( result.message ).toBe( '4rd failure' );
			expect( callback ).toHaveBeenCalledTimes( 4 );
		} );

		it( 'should wait specified time between invocations', async () => {
			const callback = vi.fn().mockRejectedValue( undefined );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 5,
				maxAttempts: 3
			} );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 4 );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 9 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 14 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 20 );

			expect( callback ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should exponentially back off by default', async () => {
			const callback = vi.fn().mockRejectedValue( undefined );

			retry( callback );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 999 );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1999 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 3999 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 4 );

			await vi.advanceTimersByTimeAsync( 8000 );

			expect( callback ).toHaveBeenCalledTimes( 4 );
		} );

		it( 'should exponentially back off by default (custom `maxAttempts`)', async () => {
			const callback = vi.fn().mockRejectedValue( undefined );

			retry( callback, {
				maxAttempts: 6
			} );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 999 );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1999 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 3999 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 4 );

			await vi.advanceTimersByTimeAsync( 7999 );

			expect( callback ).toHaveBeenCalledTimes( 4 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 5 );

			await vi.advanceTimersByTimeAsync( 9999 );

			expect( callback ).toHaveBeenCalledTimes( 5 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 6 );

			await vi.advanceTimersByTimeAsync( 10000 );

			expect( callback ).toHaveBeenCalledTimes( 6 );
		} );

		it.skip( 'should start waiting delay after the callback resolves', async () => {
			const callback = vi.fn( () => {
				return new Promise( ( resolve, reject ) => setTimeout( reject, 5 ) );
			} );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 10,
				maxAttempts: 3
			} );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 14 );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 24 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( callback ).toHaveBeenCalledTimes( 3 );

			await vi.advanceTimersByTimeAsync( 35 );

			expect( callback ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should not delay after `maxAttempts` is reached', async () => {
			const promiseFailed = vi.fn();
			const callback = vi.fn()
				.mockRejectedValueOnce( new Error( '1st failure' ) )
				.mockRejectedValueOnce( new Error( '2nd failure' ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 2
			} );

			promise.catch( promiseFailed );

			await vi.advanceTimersByTimeAsync( 10 );

			expect( callback ).toHaveBeenCalledTimes( 2 );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( promiseFailed ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should abort during the dalay', async () => {
			let done = false;
			let reason = null;
			const expectedReason = new Error( 'aborted' );
			const controller = new AbortController();
			const callback = vi.fn().mockRejectedValue( undefined );

			const promise = retry( callback, { signal: controller.signal } );

			promise.then(
				() => { done = true; },
				err => {
					done = true;
					reason = err;
				}
			);

			await vi.advanceTimersByTimeAsync( 100 );

			expect( done ).toBe( false );

			controller.abort( expectedReason );
			await vi.advanceTimersByTimeAsync( 0 );

			expect( done ).toBe( true );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			expect( reason ).toBe( expectedReason );
		} );

		it( 'should abort just after callback returns', async () => {
			let done = false;
			let reason = null;
			const expectedReason = new Error( 'aborted' );
			const controller = new AbortController();
			const callback = vi.fn( () => {
				return new Promise( ( resolve, reject ) => setTimeout( reject, 100 ) );
			} );

			const promise = retry( callback, { signal: controller.signal } );

			promise.then(
				() => { done = true; },
				err => {
					done = true;
					reason = err;
				}
			);

			expect( done ).toBe( false );

			await vi.advanceTimersByTimeAsync( 50 );

			expect( done ).toBe( false );

			controller.abort( expectedReason );

			await vi.advanceTimersByTimeAsync( 49 );

			expect( done ).toBe( false );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( done ).toBe( true );

			await vi.advanceTimersByTimeAsync( 1000 );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			expect( reason ).toBe( expectedReason );
		} );

		it( 'should not call the callback if already aborted', async () => {
			const expectedReason = new Error( 'aborted' );
			const signal = AbortSignal.abort( expectedReason );
			const callback = vi.fn();

			const promise = retry( callback, {
				signal
			} );

			const result = await promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			expect( result ).toBe( expectedReason );
			expect( callback ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'exponentialDelay', () => {
		it( 'should return delays for default configuration', () => {
			const func = exponentialDelay();

			expect( func( 0 ) ).toBe( 1000 );
			expect( func( 1 ) ).toBe( 2000 );
			expect( func( 2 ) ).toBe( 4000 );
			expect( func( 3 ) ).toBe( 8000 );
			expect( func( 4 ) ).toBe( 10000 );
			expect( func( 5 ) ).toBe( 10000 );
			expect( func( 6 ) ).toBe( 10000 );
		} );

		it( 'should return delays for custom configuration', () => {
			const func = exponentialDelay( {
				delay: 10,
				factor: 3,
				maxDelay: 300
			} );

			expect( func( 0 ) ).toBe( 10 );
			expect( func( 1 ) ).toBe( 30 );
			expect( func( 2 ) ).toBe( 90 );
			expect( func( 3 ) ).toBe( 270 );
			expect( func( 4 ) ).toBe( 300 );
			expect( func( 5 ) ).toBe( 300 );
			expect( func( 6 ) ).toBe( 300 );
		} );
	} );
} );
