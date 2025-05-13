/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import retry, { exponentialDelay } from '../src/retry.js';

describe( 'utils', () => {
	let clock;

	beforeEach( () => {
		clock = sinon.useFakeTimers();
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'retry', () => {
		it( 'returns success the first time', async () => {
			const callback = sinon.stub().returns( Promise.resolve( 'success' ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 3
			} );

			const result = await promise;

			expect( result ).to.equal( 'success' );
			expect( callback.calledOnce ).to.be.true;
		} );

		it( 'returns success the third time', async () => {
			const callback = sinon.stub();

			callback.onCall( 0 ).returns( Promise.reject( new Error( '1st failure' ) ) );
			callback.onCall( 1 ).returns( Promise.reject( new Error( '2nd failure' ) ) );
			callback.onCall( 2 ).returns( Promise.resolve( 'success' ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 6
			} );

			await clock.tickAsync( 100 );

			const result = await promise;

			expect( result ).to.equal( 'success' );
			expect( callback.callCount ).to.equal( 3 );
		} );

		it( 'should return failure after `maxAttempts`', async () => {
			const callback = sinon.stub();

			callback.onCall( 0 ).returns( Promise.reject( new Error( '1st failure' ) ) );
			callback.onCall( 1 ).returns( Promise.reject( new Error( '2nd failure' ) ) );
			callback.onCall( 2 ).returns( Promise.reject( new Error( '3rd failure' ) ) );
			callback.onCall( 3 ).returns( Promise.resolve( 'success' ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 3
			} );

			await clock.tickAsync( 100 );

			const result = await promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			expect( result ).to.be.instanceOf( Error );
			expect( result.message ).to.equal( '3rd failure' );
			expect( callback.callCount ).to.equal( 3 );
		} );

		it( 'should return failure after 4 retries by default', async () => {
			const callback = sinon.stub();

			callback.onCall( 0 ).returns( Promise.reject( new Error( '1st failure' ) ) );
			callback.onCall( 1 ).returns( Promise.reject( new Error( '2nd failure' ) ) );
			callback.onCall( 2 ).returns( Promise.reject( new Error( '3rd failure' ) ) );
			callback.onCall( 3 ).returns( Promise.reject( new Error( '4rd failure' ) ) );
			callback.onCall( 4 ).returns( Promise.resolve( 'success' ) );

			const promise = retry( callback, {
				retryDelay: () => 10
			} );

			await clock.tickAsync( 100 );

			const result = await promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			expect( result ).to.be.instanceOf( Error );
			expect( result.message ).to.equal( '4rd failure' );
			expect( callback.callCount ).to.equal( 4 );
		} );

		it( 'should wait specified time between invocations', async () => {
			const callback = sinon.stub().returns( Promise.reject() );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 5,
				maxAttempts: 3
			} );

			expect( callback.callCount, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 4 );

			expect( callback.callCount, 'after 4ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 5ms' ).to.equal( 2 );

			await clock.tickAsync( 9 );

			expect( callback.callCount, 'after 14ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 15ms' ).to.equal( 3 );

			await clock.tickAsync( 14 );

			expect( callback.callCount, 'after 29ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 30ms' ).to.equal( 3 );

			await clock.tickAsync( 20 );

			expect( callback.callCount, 'after 50ms' ).to.equal( 3 );
		} );

		it( 'should exponentially back off by default', async () => {
			const callback = sinon.stub().returns( Promise.reject() );

			retry( callback );

			expect( callback.callCount, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 999 );

			expect( callback.callCount, 'after 999ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 1000ms' ).to.equal( 2 );

			await clock.tickAsync( 1999 );

			expect( callback.callCount, 'after 2999ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 3000ms' ).to.equal( 3 );

			await clock.tickAsync( 3999 );

			expect( callback.callCount, 'after 6999ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 7000ms' ).to.equal( 4 );

			await clock.tickAsync( 8000 );

			expect( callback.callCount, 'after 15000ms' ).to.equal( 4 );
		} );

		it( 'should exponentially back off by default (custom `maxAttempts`)', async () => {
			const callback = sinon.stub().returns( Promise.reject() );

			retry( callback, {
				maxAttempts: 6
			} );

			expect( callback.callCount, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 999 );

			expect( callback.callCount, 'after 999ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 1000ms' ).to.equal( 2 );

			await clock.tickAsync( 1999 );

			expect( callback.callCount, 'after 2999ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 3000ms' ).to.equal( 3 );

			await clock.tickAsync( 3999 );

			expect( callback.callCount, 'after 6999ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 7000ms' ).to.equal( 4 );

			await clock.tickAsync( 7999 );

			expect( callback.callCount, 'after 14999ms' ).to.equal( 4 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 15000ms' ).to.equal( 5 );

			await clock.tickAsync( 9999 );

			expect( callback.callCount, 'after 24999ms' ).to.equal( 5 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 25000ms' ).to.equal( 6 );

			await clock.tickAsync( 10000 );

			expect( callback.callCount, 'after 35000ms' ).to.equal( 6 );
		} );

		it.skip( 'should start waiting delay after the callback resolves', async () => {
			const callback = sinon.stub();

			callback.callsFake( () => {
				return new Promise( ( resolve, reject ) => setTimeout( reject, 5 ) );
			} );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 10,
				maxAttempts: 3
			} );

			expect( callback.callCount, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 14 );

			expect( callback.callCount, 'after 14ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 15ms' ).to.equal( 2 );

			await clock.tickAsync( 24 );

			expect( callback.callCount, 'after 39ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( callback.callCount, 'after 40ms' ).to.equal( 3 );

			await clock.tickAsync( 35 );

			expect( callback.callCount, 'after 75ms' ).to.equal( 3 );
		} );

		it( 'should not delay after `maxAttempts` is reached', async () => {
			const promiseFailed = sinon.stub();
			const callback = sinon.stub();

			callback.onCall( 0 ).returns( Promise.reject( new Error( '1st failure' ) ) );
			callback.onCall( 1 ).returns( Promise.reject( new Error( '2nd failure' ) ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxAttempts: 2
			} );

			promise.catch( promiseFailed );

			await clock.tickAsync( 10 );

			expect( callback.callCount, 'callback count' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( promiseFailed.calledOnce, 'promise resolved' ).to.be.true;
		} );

		it( 'should abort during the dalay', async () => {
			let done = false;
			let reason = null;
			const expectedReason = new Error( 'aborted' );
			const controller = new AbortController();
			const callback = sinon.stub().returns( Promise.reject() );

			const promise = retry( callback, { signal: controller.signal } );

			promise.then(
				() => { done = true; },
				err => {
					done = true;
					reason = err;
				}
			);

			await clock.tickAsync( 100 );

			expect( done, 'after 100ms' ).to.be.false;

			controller.abort( expectedReason );
			await clock.tickAsync( 0 );

			expect( done, 'after abort' ).to.be.true;

			expect( callback.callCount ).to.equal( 1 );

			expect( reason ).to.equal( expectedReason );
		} );

		it( 'should abort just after callback returns', async () => {
			let done = false;
			let reason = null;
			const expectedReason = new Error( 'aborted' );
			const controller = new AbortController();
			const callback = sinon.stub();

			callback.callsFake( () => {
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

			expect( done, 'after 0ms' ).to.be.false;

			await clock.tickAsync( 50 );

			expect( done, 'after 50ms' ).to.be.false;

			controller.abort( expectedReason );

			await clock.tickAsync( 49 );

			expect( done, 'after 99ms' ).to.be.false;

			await clock.tickAsync( 1 );

			expect( done, 'after 100ms' ).to.be.true;

			await clock.tickAsync( 1000 );

			expect( callback.callCount ).to.equal( 1 );

			expect( reason ).to.equal( expectedReason );
		} );

		it( 'should not call the callback if already aborted', async () => {
			const expectedReason = new Error( 'aborted' );
			const signal = AbortSignal.abort( expectedReason );
			const callback = sinon.stub();

			const promise = retry( callback, {
				signal
			} );

			const result = await promise.then(
				() => { throw new Error( 'unexpected success' ); },
				err => err
			);

			expect( result ).to.equal( expectedReason );
			expect( callback.called ).to.be.false;
		} );
	} );

	describe( 'exponentialDelay', () => {
		it( 'should return delays for default configuration', () => {
			const func = exponentialDelay();

			expect( func( 0 ), 'func( 0 )' ).to.equal( 1000 );
			expect( func( 1 ), 'func( 1 )' ).to.equal( 2000 );
			expect( func( 2 ), 'func( 2 )' ).to.equal( 4000 );
			expect( func( 3 ), 'func( 3 )' ).to.equal( 8000 );
			expect( func( 4 ), 'func( 4 )' ).to.equal( 10000 );
			expect( func( 5 ), 'func( 5 )' ).to.equal( 10000 );
			expect( func( 6 ), 'func( 6 )' ).to.equal( 10000 );
		} );

		it( 'should return delays for custom configuration', () => {
			const func = exponentialDelay( {
				delay: 10,
				factor: 3,
				maxDelay: 300
			} );

			expect( func( 0 ), 'func( 0 )' ).to.equal( 10 );
			expect( func( 1 ), 'func( 1 )' ).to.equal( 30 );
			expect( func( 2 ), 'func( 2 )' ).to.equal( 90 );
			expect( func( 3 ), 'func( 3 )' ).to.equal( 270 );
			expect( func( 4 ), 'func( 4 )' ).to.equal( 300 );
			expect( func( 5 ), 'func( 5 )' ).to.equal( 300 );
			expect( func( 6 ), 'func( 6 )' ).to.equal( 300 );
		} );
	} );
} );
