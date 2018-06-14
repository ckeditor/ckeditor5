/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import throttle from '../src/throttle';

describe( 'throttle', () => {
	const sandbox = sinon.sandbox.create( {
		useFakeTimers: true
	} );

	beforeEach( () => {
		sandbox.useFakeTimers( { now: 1000 } );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'should run first call synchronously', () => {
		const spy = sinon.spy();
		const throttledFn = throttle( spy, 100 );

		throttledFn();

		sinon.assert.calledOnce( spy );

		sandbox.clock.runAll();
		sinon.assert.calledOnce( spy );
	} );

	it( 'should run next calls at the specified maximum rate', () => {
		const spy = sinon.spy();
		const throttledFn = throttle( spy, 100 );

		throttledFn();
		throttledFn();

		sinon.assert.calledOnce( spy );

		sandbox.clock.tick( 99 );

		sinon.assert.calledOnce( spy );

		sandbox.clock.tick( 1 );

		sinon.assert.calledTwice( spy );
		sandbox.clock.runAll();
	} );

	it( 'should run next calls at the specified maximum rate', () => {
		const spy = sinon.spy();
		const throttledFn = throttle( spy, 100 );

		throttledFn();
		throttledFn();

		sinon.assert.calledOnce( spy );

		sandbox.clock.tick( 99 );

		sinon.assert.calledOnce( spy );

		sandbox.clock.tick( 1 );

		sinon.assert.calledTwice( spy );

		sandbox.clock.runAll();
		sinon.assert.calledTwice( spy );
	} );

	it( 'should skip the call if another call is scheduled', () => {
		const spy = sinon.spy();
		const throttledFn = throttle( spy, 100 );

		const isFirstInvoked = throttledFn();
		const willSecondInvoke = throttledFn();
		const willThirdInvoke = throttledFn();

		expect( isFirstInvoked ).to.be.true;
		expect( willSecondInvoke ).to.be.true;
		expect( willThirdInvoke ).to.be.false;

		sandbox.clock.runAll();
		sinon.assert.calledTwice( spy );
	} );

	it( 'should call the next call after the specified amount of time', () => {
		const spy = sinon.spy();
		const throttledFn = throttle( spy, 100 );

		throttledFn();
		throttledFn();

		sandbox.clock.tick( 50 );

		sinon.assert.calledOnce( spy );

		sandbox.clock.tick( 50 );

		sinon.assert.calledTwice( spy );

		throttledFn();

		sandbox.clock.tick( 100 );

		sinon.assert.calledThrice( spy );
	} );

	describe( 'flush', () => {
		it( 'should be provide as a method on the throttled function', () => {
			const spy = sinon.spy();
			const throttledFn = throttle( spy, 100 );

			expect( throttledFn.flush ).to.be.a( 'function' );
		} );

		it( 'should enable calling the throttled call immediately', () => {
			const spy = sinon.spy();
			const throttledFn = throttle( spy, 100 );

			throttledFn();
			throttledFn();

			sinon.assert.calledOnce( spy );

			throttledFn.flush();
			sinon.assert.calledTwice( spy );

			sandbox.clock.runAll();
			sinon.assert.calledTwice( spy );
		} );

		it( 'should do nothing if there is no scheduled call', () => {
			const spy = sinon.spy();
			const throttledFn = throttle( spy, 100 );

			throttledFn();

			sinon.assert.calledOnce( spy );

			throttledFn.flush();
			sinon.assert.calledOnce( spy );

			sandbox.clock.runAll();
			sinon.assert.calledOnce( spy );
		} );

		it( 'should enable calling after the flushed call', () => {
			const spy = sinon.spy();
			const throttledFn = throttle( spy, 100 );

			throttledFn();
			throttledFn();
			throttledFn.flush();
			throttledFn();

			sinon.assert.calledThrice( spy );

			sandbox.clock.runAll();
			sinon.assert.calledThrice( spy );
		} );
	} );
} );
