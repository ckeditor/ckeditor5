/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals setTimeout */

import retry, { exponentialDelay } from '../src/retry';

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
				maxRetries: 2
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
				maxRetries: 5
			} );

			await clock.tickAsync( 100 );

			const result = await promise;

			expect( result ).to.equal( 'success' );
			expect( callback.callCount ).to.equal( 3 );
		} );

		it( 'should return failure after `maxRetries`', async () => {
			const callback = sinon.stub();

			callback.onCall( 0 ).returns( Promise.reject( new Error( '1st failure' ) ) );
			callback.onCall( 1 ).returns( Promise.reject( new Error( '2nd failure' ) ) );
			callback.onCall( 2 ).returns( Promise.reject( new Error( '3rd failure' ) ) );
			callback.onCall( 3 ).returns( Promise.resolve( 'success' ) );

			const promise = retry( callback, {
				retryDelay: () => 10,
				maxRetries: 2
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

		it( 'should return failure after 3 retries by default', async () => {
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
			let attempt = 0;
			const callback = sinon.stub();

			callback.callsFake( () => {
				attempt++;

				return Promise.reject();
			} );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 5,
				maxRetries: 2
			} );

			expect( attempt, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 4 );

			expect( attempt, 'after 4ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 5ms' ).to.equal( 2 );

			await clock.tickAsync( 9 );

			expect( attempt, 'after 14ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 15ms' ).to.equal( 3 );

			await clock.tickAsync( 14 );

			expect( attempt, 'after 29ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 30ms' ).to.equal( 3 );

			await clock.tickAsync( 20 );

			expect( attempt, 'after 50ms' ).to.equal( 3 );
		} );

		it( 'should exponentially back off by default', async () => {
			let attempt = 0;
			const callback = sinon.stub();

			callback.callsFake( () => {
				attempt++;

				return Promise.reject();
			} );

			retry( callback );

			expect( attempt, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 999 );

			expect( attempt, 'after 999ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 1000ms' ).to.equal( 2 );

			await clock.tickAsync( 1999 );

			expect( attempt, 'after 2999ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 3000ms' ).to.equal( 3 );

			await clock.tickAsync( 3999 );

			expect( attempt, 'after 6999ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 7000ms' ).to.equal( 4 );

			await clock.tickAsync( 8000 );

			expect( attempt, 'after 15000ms' ).to.equal( 4 );
		} );

		it( 'should exponentially back off by default (custom `maxRetries`)', async () => {
			let attempt = 0;
			const callback = sinon.stub();

			callback.callsFake( () => {
				attempt++;

				return Promise.reject();
			} );

			retry( callback, {
				maxRetries: 5
			} );

			expect( attempt, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 999 );

			expect( attempt, 'after 999ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 1000ms' ).to.equal( 2 );

			await clock.tickAsync( 1999 );

			expect( attempt, 'after 2999ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 3000ms' ).to.equal( 3 );

			await clock.tickAsync( 3999 );

			expect( attempt, 'after 6999ms' ).to.equal( 3 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 7000ms' ).to.equal( 4 );

			await clock.tickAsync( 7999 );

			expect( attempt, 'after 14999ms' ).to.equal( 4 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 15000ms' ).to.equal( 5 );

			await clock.tickAsync( 9999 );

			expect( attempt, 'after 24999ms' ).to.equal( 5 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 25000ms' ).to.equal( 6 );

			await clock.tickAsync( 10000 );

			expect( attempt, 'after 35000ms' ).to.equal( 6 );
		} );

		it( 'should start waiting delay after the callback resolves', async () => {
			let attempt = 0;
			const callback = sinon.stub();

			callback.callsFake( () => {
				attempt++;

				return new Promise( ( resolve, reject ) => setTimeout( reject, 5 ) );
			} );

			retry( callback, {
				retryDelay: attempt => ( attempt + 1 ) * 10,
				maxRetries: 2
			} );

			expect( attempt, 'after 0ms' ).to.equal( 1 );

			await clock.tickAsync( 14 );

			expect( attempt, 'after 14ms' ).to.equal( 1 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 15ms' ).to.equal( 2 );

			await clock.tickAsync( 24 );

			expect( attempt, 'after 39ms' ).to.equal( 2 );

			await clock.tickAsync( 1 );

			expect( attempt, 'after 40ms' ).to.equal( 3 );

			await clock.tickAsync( 35 );

			expect( attempt, 'after 75ms' ).to.equal( 3 );
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
