/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import wait from '../src/wait.js';

describe( 'utils', () => {
	let clock;

	beforeEach( () => {
		clock = sinon.useFakeTimers();
	} );

	afterEach( () => {
		sinon.restore();
	} );

	describe( 'wait', () => {
		it( 'should return a promise', () => {
			const promise = wait( 0 );

			expect( promise ).to.be.instanceOf( Promise );
		} );

		it( 'should wait the specified time (10ms)', async () => {
			const promise = wait( 10 );

			await clock.tickAsync( 9 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'pending' } );

			await clock.tickAsync( 1 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'fulfilled', value: undefined } );
		} );

		it( 'should wait the specified time (20ms)', async () => {
			const promise = wait( 20 );

			await clock.tickAsync( 19 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'pending' } );

			await clock.tickAsync( 1 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'fulfilled', value: undefined } );
		} );

		it( 'should abort', async () => {
			const reason = new Error( 'aborted' );
			const controller = new AbortController();

			const promise = wait( 20, { signal: controller.signal } );

			await clock.tickAsync( 10 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'pending' } );

			controller.abort( reason );
			await clock.tickAsync( 0 );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'rejected', reason } );
		} );

		it( 'should return rejected promise if already aborted', async () => {
			const reason = new Error( 'aborted' );

			const promise = wait( 20, { signal: AbortSignal.abort( reason ) } );

			expect( await promiseStatus( promise ) ).to.deep.equal( { status: 'rejected', reason } );
		} );

		it( 'should clean abort handler', async () => {
			const signal = {
				throwIfAborted: () => {},
				addEventListener: sinon.stub(),
				removeEventListener: sinon.stub()
			};

			wait( 20, { signal } );

			await clock.tickAsync( 20 );

			expect( signal.addEventListener.callCount, 'addEventListener' ).to.equal( 1 );
			expect( signal.removeEventListener.callCount, 'removeEventListener' ).to.equal( 1 );
			sinon.assert.calledWith( signal.addEventListener, 'abort', sinon.match.func, sinon.match.has( 'once', true ) );
		} );

		it( 'should clean the timer', async () => {
			const controller = new AbortController();

			wait( 20, { signal: controller.signal } );

			await clock.tickAsync( 10 );

			expect( clock.countTimers(), 'before abort' ).to.equal( 1 );

			controller.abort();

			expect( clock.countTimers(), 'after abort' ).to.equal( 0 );
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
