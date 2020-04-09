/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout, Event, console */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import Rect from '../../src/dom/rect';
import global from '../../src/dom/global';
import DomEmitterMixin from '../../src/dom/emittermixin';
import ResizeObserver from '../../src/dom/resizeobserver';

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

		it( 'should use the polyfill when no native implementation available', () => {
			testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( null );

			const observer = new ResizeObserver( elementA, () => {} );

			expect( ResizeObserver._observerInstance.constructor.name ).to.equal( 'ResizeObserverPolyfill' );

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

		it( 'should not react to resizing of an element if element is invisible', () => {
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

			elementA.style.display = 'none';

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.notCalled( callbackA );

			observerA.destroy();
		} );

		it( 'should not react to resizing of an element if element\'s parent is invisible', () => {
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
			const parent = document.createElement( 'div' );
			document.body.appendChild( parent );
			parent.appendChild( elementA );
			parent.style.display = 'none';

			resizeCallback( [
				{ target: elementA }
			] );

			sinon.assert.notCalled( callbackA );

			parent.remove();
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

	describe( 'ResizeObserverPolyfill', () => {
		let callback, elementRectA, elementRectB;

		beforeEach( () => {
			testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( null );

			callback = sinon.spy();

			elementRectA = {
				top: 10,
				right: 20,
				bottom: 20,
				left: 0,
				height: 10,
				width: 20
			};

			elementRectB = {
				top: 0,
				right: 10,
				bottom: 10,
				left: 0,
				height: 10,
				width: 10
			};

			elementA.getBoundingClientRect = () => elementRectA;
			elementB.getBoundingClientRect = () => elementRectB;

			document.body.appendChild( elementA );
			document.body.appendChild( elementB );
		} );

		afterEach( () => {
			elementA.remove();
			elementB.remove();
		} );

		it( 'mixes DomEmitterMixin', () => {
			const observer = new ResizeObserver( elementA, () => {} );

			expect( testUtils.isMixed( ResizeObserver._observerInstance.constructor, DomEmitterMixin ) ).to.be.true;

			observer.destroy();
		} );

		describe( 'observe()', () => {
			it( 'calls the callback immediatelly', () => {
				const observer = new ResizeObserver( elementA, callback );

				sinon.assert.calledOnce( callback );

				const { target, contentRect } = callback.firstCall.args[ 0 ];

				expect( target ).to.equal( elementA );
				expect( contentRect ).to.be.instanceOf( Rect );
				expect( contentRect ).to.deep.equal( elementRectA );

				observer.destroy();
			} );

			it( 'does not execute the callback if element has no parent in DOM', () => {
				const warnSpy = testUtils.sinon.spy( console, 'warn' );

				elementA.remove();

				const observer = new ResizeObserver( elementA, callback );

				sinon.assert.notCalled( callback );
				sinon.assert.notCalled( warnSpy );

				observer.destroy();
			} );

			it( 'starts periodic check and asynchronously does not execute the callback if the element rect is the same', done => {
				const observer = new ResizeObserver( elementA, callback );

				setTimeout( () => {
					sinon.assert.calledOnce( callback );

					observer.destroy();
					done();
				}, 200 );
			} );

			it( 'starts periodic check and asynchronously executes the callback if the element rect changed', done => {
				const observer = new ResizeObserver( elementA, callback );

				sinon.assert.calledOnce( callback );

				const newRect = {
					top: 30,
					right: 10,
					bottom: 40,
					left: 0,
					height: 10,
					width: 10
				};

				elementA.getBoundingClientRect = () => newRect;

				setTimeout( () => {
					sinon.assert.calledTwice( callback );

					const { target, contentRect } = callback.secondCall.args[ 0 ];

					expect( target ).to.equal( elementA );
					expect( contentRect ).to.deep.equal( newRect );

					observer.destroy();
					done();
				}, 200 );
			} );

			it( 'starts periodic check and asynchronously executes the callback if multiple element rects changed', done => {
				const callbackA = sinon.spy();
				const callbackB = sinon.spy();

				const observerA = new ResizeObserver( elementA, callbackA );
				const observerB = new ResizeObserver( elementB, callbackB );

				sinon.assert.calledOnce( callbackA );
				sinon.assert.calledOnce( callbackB );

				const newRectA = {
					top: 30,
					right: 10,
					bottom: 40,
					left: 0,
					height: 10,
					width: 10
				};

				const newRectB = {
					top: 30,
					right: 100,
					bottom: 40,
					left: 0,
					height: 10,
					width: 100
				};

				elementA.getBoundingClientRect = () => newRectA;
				elementB.getBoundingClientRect = () => newRectB;

				setTimeout( () => {
					sinon.assert.calledTwice( callbackA );
					sinon.assert.calledTwice( callbackB );

					const { target: targetA, contentRect: contentRectA } = callbackA.secondCall.args[ 0 ];
					const { target: targetB, contentRect: contentRectB } = callbackB.secondCall.args[ 0 ];

					expect( targetA ).to.equal( elementA );
					expect( contentRectA ).to.deep.equal( newRectA );

					expect( targetB ).to.equal( elementB );
					expect( contentRectB ).to.deep.equal( newRectB );

					observerA.destroy();
					observerB.destroy();
					done();
				}, 200 );
			} );

			it( 'starts periodic check and synchronously responds to window resize', () => {
				const observer = new ResizeObserver( elementA, callback );
				sinon.assert.calledOnce( callback );

				const newRectA = {
					top: 30,
					right: 10,
					bottom: 40,
					left: 0,
					height: 10,
					width: 10
				};

				elementA.getBoundingClientRect = () => newRectA;

				global.window.dispatchEvent( new Event( 'resize' ) );

				sinon.assert.calledTwice( callback );

				const { target: targetA, contentRect: contentRectA } = callback.secondCall.args[ 0 ];

				expect( targetA ).to.equal( elementA );
				expect( contentRectA ).to.deep.equal( newRectA );

				observer.destroy();
			} );
		} );

		describe( 'unobserve()', () => {
			it( 'removes the element from the observer so no future changes to the element execute the callback', done => {
				const observer = new ResizeObserver( elementA, callback );
				sinon.assert.calledOnce( callback );

				const newRect = {
					top: 30,
					right: 10,
					bottom: 40,
					left: 0,
					height: 10,
					width: 10
				};

				observer.destroy();

				elementA.getBoundingClientRect = () => newRect;

				setTimeout( () => {
					sinon.assert.calledOnce( callback );

					done();
				}, 200 );
			} );

			it( 'disables the Emitter when no elements left in the observer', () => {
				const observer = new ResizeObserver( elementA, callback );
				const stopCheckSpy = testUtils.sinon.spy( ResizeObserver._observerInstance, '_stopPeriodicCheck' );

				sinon.assert.calledOnce( callback );

				observer.destroy();
				sinon.assert.calledOnce( stopCheckSpy );
			} );
		} );
	} );
} );
