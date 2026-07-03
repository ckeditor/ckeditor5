/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { wait } from '../src/wait.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe( 'utils', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	describe( 'wait', () => {
		it( 'should return a promise', () => {
			const promise = wait( 0 );

			expect( promise ).to.be.instanceOf( Promise );
		} );

		it( 'should wait the specified time (10ms)', async () => {
			const promise = wait( 10 );

			await vi.advanceTimersByTimeAsync( 9 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'pending' } );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'fulfilled', value: undefined } );
		} );

		it( 'should wait the specified time (20ms)', async () => {
			const promise = wait( 20 );

			await vi.advanceTimersByTimeAsync( 19 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'pending' } );

			await vi.advanceTimersByTimeAsync( 1 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'fulfilled', value: undefined } );
		} );

		it( 'should abort', async () => {
			const reason = new Error( 'aborted' );
			const controller = new AbortController();

			const promise = wait( 20, { signal: controller.signal } );

			await vi.advanceTimersByTimeAsync( 10 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'pending' } );

			controller.abort( reason );
			await vi.advanceTimersByTimeAsync( 0 );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'rejected', reason } );
		} );

		it( 'should return rejected promise if already aborted', async () => {
			const reason = new Error( 'aborted' );

			const promise = wait( 20, { signal: AbortSignal.abort( reason ) } );

			expect( await promiseStatus( promise ) ).toEqual( { status: 'rejected', reason } );
		} );

		it( 'should clean abort handler', async () => {
			const signal = {
				throwIfAborted: () => {},
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};

			wait( 20, { signal } );

			await vi.advanceTimersByTimeAsync( 20 );

			expect( signal.addEventListener, 'addEventListener' ).toHaveBeenCalledTimes( 1 );
			expect( signal.removeEventListener, 'removeEventListener' ).toHaveBeenCalledTimes( 1 );
			expect( signal.addEventListener ).toHaveBeenCalledWith(
				'abort',
				expect.any( Function ),
				expect.objectContaining( { once: true } )
			);
		} );

		it( 'should clean the timer', async () => {
			const controller = new AbortController();

			const promise = wait( 20, { signal: controller.signal } );
			promise.catch( () => {} );

			await vi.advanceTimersByTimeAsync( 10 );

			expect( vi.getTimerCount(), 'before abort' ).toBe( 1 );

			controller.abort();

			expect( vi.getTimerCount(), 'after abort' ).toBe( 0 );
		} );
	} );
} );

function promiseStatus( promise ) {
	const pendingState = { status: 'pending' };

	return Promise.race( [ promise, pendingState ] ).then(
		value => value == pendingState ? value : { status: 'fulfilled', value },
		reason => ( { status: 'rejected', reason } )
	);
}
