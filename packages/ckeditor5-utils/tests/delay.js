/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import delay from '../src/delay.js';

describe( 'utils', () => {
	describe( 'delay', () => {
		let clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'should create a function', () => {
			const callback = () => {};
			const delayed = delay( callback, 100 );

			expect( typeof delayed ).to.equal( 'function' );
		} );

		it( 'should create a function that triggers callback after a delay', () => {
			const spy = sinon.spy();
			const delayed = delay( spy, 100 );

			sinon.assert.notCalled( spy );
			delayed();

			sinon.assert.notCalled( spy );
			clock.tick( 90 );
			sinon.assert.notCalled( spy );
			clock.tick( 10 );
			sinon.assert.calledOnce( spy );
		} );

		it( 'should pass arguments to the callback', () => {
			const spy = sinon.spy();
			const delayed = delay( spy, 100 );

			sinon.assert.notCalled( spy );
			delayed( 'foo', 123 );

			sinon.assert.notCalled( spy );
			clock.tick( 100 );
			sinon.assert.calledOnceWithExactly( spy, 'foo', 123 );
		} );

		it( 'should be cancellable', () => {
			const spy = sinon.spy();
			const delayed = delay( spy, 100 );

			sinon.assert.notCalled( spy );
			delayed();

			sinon.assert.notCalled( spy );
			clock.tick( 80 );
			sinon.assert.notCalled( spy );
			delayed.cancel();
			sinon.assert.notCalled( spy );
			clock.tick( 100 );
			sinon.assert.notCalled( spy );
		} );

		it( 'should reset time counting on next call', () => {
			const spy = sinon.spy();
			const delayed = delay( spy, 100 );

			sinon.assert.notCalled( spy );
			delayed( 'first' );

			sinon.assert.notCalled( spy );
			clock.tick( 80 );
			sinon.assert.notCalled( spy );

			delayed( 'second' );
			sinon.assert.notCalled( spy );
			clock.tick( 50 );
			sinon.assert.notCalled( spy );
			clock.tick( 50 );
			sinon.assert.calledOnceWithExactly( spy, 'second' );
		} );
	} );
} );
