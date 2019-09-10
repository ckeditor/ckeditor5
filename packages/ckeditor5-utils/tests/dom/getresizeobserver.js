/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, setTimeout, Event */

import getResizeObserver from '../../src/dom/getresizeobserver';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

describe( 'getResizeObserver()', () => {
	testUtils.createSinonSandbox();

	it( 'returns the native implementation if available', () => {
		testUtils.sinon.stub( global.window, 'ResizeObserver' ).callsFake( function( callback ) {
			this.callback = callback;
		} );

		expect( getResizeObserver( 'foo' ).callback ).to.equal( 'foo' );
	} );

	it( 'returns the polyfill when no native implementation available', () => {
		testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( null );

		expect( getResizeObserver().constructor.name ).to.equal( 'ResizeObserverPolyfill' );
	} );

	describe( 'ResizeObserverPolyfill', () => {
		let elementA, elementB, observer, callback, elementRectA, elementRectB;

		beforeEach( () => {
			testUtils.sinon.stub( global.window, 'ResizeObserver' ).value( null );

			callback = sinon.spy();
			observer = getResizeObserver( callback );

			elementA = document.createElement( 'div' );
			elementB = document.createElement( 'div' );

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
			observer.disconnect();

			elementA.remove();
			elementB.remove();
		} );

		it( 'mixes DomEmitterMixin', () => {
			expect( testUtils.isMixed( getResizeObserver().constructor, DomEmitterMixin ) ).to.be.true;
		} );

		describe( 'observe()', () => {
			it( 'calls the callback immediatelly', () => {
				observer.observe( elementA );

				sinon.assert.calledOnce( callback );

				const { target, contentRect } = callback.firstCall.args[ 0 ][ 0 ];

				expect( target ).to.equal( elementA );
				expect( contentRect ).to.be.instanceOf( Rect );
				expect( contentRect ).to.deep.equal( elementRectA );
			} );

			it( 'starts periodic check and asynchronously does not execute the callback if the element rect is the same', done => {
				observer.observe( elementA );

				setTimeout( () => {
					sinon.assert.calledOnce( callback );
					done();
				}, 200 );
			} );

			it( 'starts periodic check and asynchronously executes the callback if the element rect changed', done => {
				observer.observe( elementA );
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

					const { target, contentRect } = callback.secondCall.args[ 0 ][ 0 ];

					expect( target ).to.equal( elementA );
					expect( contentRect ).to.deep.equal( newRect );

					done();
				}, 200 );
			} );

			it( 'starts periodic check and asynchronously executes the callback if multiple element rects changed', done => {
				observer.observe( elementA );
				observer.observe( elementB );
				sinon.assert.calledOnce( callback );

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
					sinon.assert.calledTwice( callback );

					const { target: targetA, contentRect: contentRectA } = callback.secondCall.args[ 0 ][ 0 ];
					const { target: targetB, contentRect: contentRectB } = callback.secondCall.args[ 0 ][ 1 ];

					expect( targetA ).to.equal( elementA );
					expect( contentRectA ).to.deep.equal( newRectA );

					expect( targetB ).to.equal( elementB );
					expect( contentRectB ).to.deep.equal( newRectB );

					done();
				}, 200 );
			} );

			it( 'starts periodic check and synchronously responds to window resize', () => {
				observer.observe( elementA );
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

				const { target: targetA, contentRect: contentRectA } = callback.secondCall.args[ 0 ][ 0 ];

				expect( targetA ).to.equal( elementA );
				expect( contentRectA ).to.deep.equal( newRectA );
			} );
		} );

		describe( 'unobserve()', () => {
			it( 'removes the element from the observer so no future changes to the element execute the callback', done => {
				observer.observe( elementA );
				sinon.assert.calledOnce( callback );

				const newRect = {
					top: 30,
					right: 10,
					bottom: 40,
					left: 0,
					height: 10,
					width: 10
				};

				observer.unobserve( elementA );

				elementA.getBoundingClientRect = () => newRect;

				setTimeout( () => {
					sinon.assert.calledOnce( callback );

					done();
				}, 200 );
			} );

			it( 'does not affect the callback being executed for other elements in the observer', done => {
				observer.observe( elementA );
				observer.observe( elementB );
				sinon.assert.calledOnce( callback );

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

				observer.unobserve( elementA );

				setTimeout( () => {
					sinon.assert.calledTwice( callback );

					const { target: targetB, contentRect: contentRectB } = callback.secondCall.args[ 0 ][ 0 ];

					expect( callback.secondCall.args[ 0 ] ).to.have.length( 1 );

					expect( targetB ).to.equal( elementB );
					expect( contentRectB ).to.deep.equal( newRectB );

					done();
				}, 200 );
			} );

			it( 'disables the Emitter when no elements left in the observer', () => {
				const stopCheckSpy = testUtils.sinon.spy( observer, '_stopPeriodicCheck' );

				observer.observe( elementA );
				sinon.assert.calledOnce( callback );

				observer.unobserve( elementA );
				sinon.assert.calledOnce( stopCheckSpy );
			} );
		} );

		describe( 'disconnect()', () => {
			it( 'calls unobserve() for all observed elements', () => {
				observer.observe( elementA );
				observer.observe( elementB );

				const unobserveSpy = testUtils.sinon.spy( observer, 'unobserve' );

				observer.disconnect();

				sinon.assert.calledTwice( unobserveSpy );
				sinon.assert.calledWith( unobserveSpy.firstCall, elementA );
				sinon.assert.calledWith( unobserveSpy.secondCall, elementB );
			} );
		} );
	} );
} );
