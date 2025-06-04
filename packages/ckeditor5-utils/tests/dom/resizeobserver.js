/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import global from '../../src/dom/global.js';
import ResizeObserver from '../../src/dom/resizeobserver.js';

describe( 'ResizeObserver()', () => {
	let elementA, elementB;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// Make sure other tests of the editor do not affect tests that follow.
		// Without it, if an instance of ResizeObserver already exists somewhere undestroyed
		// in DOM, any DOM mock will have no effect.
		ResizeObserver._observerInstance = null;

		elementA = document.createElement( 'div' );
		elementA.id = 'A';
		elementB = document.createElement( 'div' );
		elementB.id = 'B';

		document.body.appendChild( elementA );
		document.body.appendChild( elementB );
	} );

	afterEach( () => {
		// Make it look like the module was loaded from scratch.
		ResizeObserver._observerInstance = null;
		ResizeObserver._elementCallbacks = null;

		elementA.remove();
		elementB.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should use the native implementation if available', () => {
			const spy = sinon.spy();

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( () => {
				return {
					observe: spy,
					unobserve: sinon.spy()
				};
			} );

			const observer = new ResizeObserver( elementA, () => {} );

			sinon.assert.calledOnce( spy );

			observer.destroy();
		} );

		it( 'should re-use the same native observer instance over and over again', () => {
			const elementA = document.createElement( 'div' );
			const elementB = document.createElement( 'div' );

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( () => {
				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, () => {} );
			const observerB = new ResizeObserver( elementB, () => {} );

			sinon.assert.calledOnce( global.window.ResizeObserver );

			observerA.destroy();
			observerB.destroy();
		} );

		it( 'should react to resizing of an element', () => {
			const callbackA = sinon.spy();
			let resizeCallback;

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledOnce( callbackA );
			sinon.assert.calledWithExactly( callbackA.firstCall, { target: elementA } );

			observerA.destroy();
		} );

		it( 'should be able to observe the same element along with other observers', () => {
			const callbackA = sinon.spy();
			const callbackB = sinon.spy();
			let resizeCallback;

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );
			const observerB = new ResizeObserver( elementA, callbackB );

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledOnce( callbackA );
			sinon.assert.calledWithExactly( callbackA, { target: elementA } );
			sinon.assert.calledOnce( callbackB );
			sinon.assert.calledWithExactly( callbackB, { target: elementA } );

			observerA.destroy();
			observerB.destroy();
		} );

		it( 'should not be affected by other observers being destroyed', () => {
			const callbackA = sinon.spy();
			const callbackB = sinon.spy();
			let resizeCallback;

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );
			const observerB = new ResizeObserver( elementA, callbackB );

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledOnce( callbackA );
			sinon.assert.calledWithExactly( callbackA, { target: elementA } );
			sinon.assert.calledOnce( callbackB );
			sinon.assert.calledWithExactly( callbackB, { target: elementA } );

			observerB.destroy();

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledTwice( callbackA );
			sinon.assert.calledWithExactly( callbackA.secondCall, { target: elementA } );
			sinon.assert.calledOnce( callbackB );
			sinon.assert.calledWithExactly( callbackB, { target: elementA } );

			observerA.destroy();
		} );
	} );

	describe( 'element', () => {
		it( 'should return observed element', () => {
			const observer = new ResizeObserver( elementA, () => {} );

			expect( observer.element ).to.equal( elementA );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should make the observer stop responding to resize of an element', () => {
			const callbackA = sinon.spy();
			let resizeCallback;

			testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( callback => {
				resizeCallback = callback;

				return {
					observe() {},
					unobserve() {}
				};
			} );

			const observerA = new ResizeObserver( elementA, callbackA );

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledOnce( callbackA );

			observerA.destroy();

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.calledOnce( callbackA );
		} );

		it( 'should not throw if called multiple times', () => {
			const callbackA = sinon.spy();
			const observerA = new ResizeObserver( elementA, callbackA );

			expect( () => {
				observerA.destroy();
				observerA.destroy();
			} ).to.not.throw();
		} );
	} );
} );
