/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, Text */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import isRange from '../../src/dom/isrange';
import { scrollViewportToShowTarget, scrollAncestorsToShowTarget } from '../../src/dom/scroll';

describe( 'scrollAncestorsToShowTarget()', () => {
	let target, element, firstAncestor, secondAncestor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'p' );
		firstAncestor = document.createElement( 'blockquote' );
		secondAncestor = document.createElement( 'div' );

		document.body.appendChild( secondAncestor );
		secondAncestor.appendChild( firstAncestor );
		firstAncestor.appendChild( element );

		// Make the element immune to the border-width-* styles in the test environment.
		testUtils.sinon.stub( window, 'getComputedStyle' ).returns( {
			borderTopWidth: '0px',
			borderRightWidth: '0px',
			borderBottomWidth: '0px',
			borderLeftWidth: '0px',
			direction: 'ltr'
		} );

		stubRect( firstAncestor, {
			top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100
		}, {
			scrollLeft: 100, scrollTop: 100
		} );

		stubRect( secondAncestor, {
			top: -100, right: 0, bottom: 0, left: -100, width: 100, height: 100
		}, {
			scrollLeft: 100, scrollTop: 100
		} );

		stubRect( document.body, {
			top: 1000, right: 2000, bottom: 1000, left: 1000, width: 1000, height: 1000
		}, {
			scrollLeft: 1000, scrollTop: 1000
		} );
	} );

	afterEach( () => {
		secondAncestor.remove();
	} );

	describe( 'for an HTMLElement', () => {
		beforeEach( () => {
			target = element;
		} );

		test();
	} );

	describe( 'for a DOM Range', () => {
		beforeEach( () => {
			target = document.createRange();
			target.setStart( firstAncestor, 0 );
			target.setEnd( firstAncestor, 0 );
		} );

		test();

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (above, attached to the Text)', () => {
			const text = new Text( 'foo' );
			firstAncestor.appendChild( text );
			target.setStart( text, 1 );
			target.setEnd( text, 2 );

			stubRect( target, { top: -100, right: 75, bottom: 0, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 0, scrollLeft: 100 } );
		} );
	} );

	function test() {
		it( 'should not touch the #scrollTop #scrollLeft of the ancestor if target is visible', () => {
			stubRect( target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollLeft: 100, scrollTop: 100 } );
		} );

		it( 'should not touch the #scrollTop #scrollLeft of the document.body', () => {
			stubRect( target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( document.body, { scrollLeft: 1000, scrollTop: 1000 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (above)', () => {
			stubRect( target, { top: -100, right: 75, bottom: 0, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 0, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (below)', () => {
			stubRect( target, { top: 200, right: 75, bottom: 300, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 300, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (left of)', () => {
			stubRect( target, { top: 0, right: 0, bottom: 100, left: -100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 0 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (right of)', () => {
			stubRect( target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of all the ancestors', () => {
			stubRect( target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
			// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
			// the getBoundingClientRect geometry of the target. That's why scrolling secondAncestor
			// works like the target remained in the original position and hence scrollLeft is 300 instead
			// of 200.
			assertScrollPosition( secondAncestor, { scrollTop: 200, scrollLeft: 300 } );
		} );
	}
} );

describe( 'scrollViewportToShowTarget()', () => {
	let target, firstAncestor, element;
	const viewportOffset = 30;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'p' );
		firstAncestor = document.createElement( 'blockquote' );

		document.body.appendChild( firstAncestor );
		firstAncestor.appendChild( element );

		stubRect( firstAncestor, {
			top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100
		}, {
			scrollLeft: 100, scrollTop: 100
		} );

		testUtils.sinon.stub( window, 'innerWidth' ).value( 1000 );
		testUtils.sinon.stub( window, 'innerHeight' ).value( 500 );
		testUtils.sinon.stub( window, 'scrollX' ).value( 100 );
		testUtils.sinon.stub( window, 'scrollY' ).value( 100 );
		testUtils.sinon.stub( window, 'scrollTo' );
		testUtils.sinon.stub( window, 'getComputedStyle' ).returns( {
			borderTopWidth: '0px',
			borderRightWidth: '0px',
			borderBottomWidth: '0px',
			borderLeftWidth: '0px',
			direction: 'ltr'
		} );

		// Assuming 20px v- and h-scrollbars here.
		testUtils.sinon.stub( window.document, 'documentElement' ).value( {
			clientWidth: 980,
			clientHeight: 480
		} );
	} );

	afterEach( () => {
		firstAncestor.remove();
	} );

	describe( 'for an HTMLElement', () => {
		beforeEach( () => {
			target = element;
		} );

		testNoOffset();

		describe( 'with a viewportOffset', () => {
			testWithOffset();
		} );
	} );

	describe( 'for a DOM Range', () => {
		beforeEach( () => {
			target = document.createRange();
			target.setStart( firstAncestor, 0 );
			target.setEnd( firstAncestor, 0 );
		} );

		testNoOffset();

		describe( 'with a viewportOffset', () => {
			testWithOffset();
		} );
	} );

	describe( 'in an iframe', () => {
		let iframe, iframeWindow, iframeAncestor, target, targetAncestor;

		beforeEach( done => {
			iframe = document.createElement( 'iframe' );
			iframeAncestor = document.createElement( 'div' );

			iframe.addEventListener( 'load', () => {
				iframeWindow = iframe.contentWindow;

				testUtils.sinon.stub( iframeWindow, 'innerWidth' ).value( 1000 );
				testUtils.sinon.stub( iframeWindow, 'innerHeight' ).value( 500 );
				testUtils.sinon.stub( iframeWindow, 'scrollX' ).value( 100 );
				testUtils.sinon.stub( iframeWindow, 'scrollY' ).value( 100 );
				testUtils.sinon.stub( iframeWindow, 'scrollTo' );
				testUtils.sinon.stub( iframeWindow, 'getComputedStyle' ).returns( {
					borderTopWidth: '0px',
					borderRightWidth: '0px',
					borderBottomWidth: '0px',
					borderLeftWidth: '0px',
					direction: 'ltr'
				} );

				// Assuming 20px v- and h-scrollbars here.
				testUtils.sinon.stub( iframeWindow.document, 'documentElement' ).value( {
					clientWidth: 980,
					clientHeight: 480
				} );

				target = iframeWindow.document.createElement( 'p' );
				targetAncestor = iframeWindow.document.createElement( 'div' );
				iframeWindow.document.body.appendChild( targetAncestor );
				targetAncestor.appendChild( target );

				done();
			} );

			iframeAncestor.appendChild( iframe );
			document.body.appendChild( iframeAncestor );
		} );

		afterEach( () => {
			// Safari fails because of "afterEach()" hook tries to restore values from removed element.
			// We need to restore these values manually.
			testUtils.sinon.restore();
			iframeAncestor.remove();
		} );

		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubRect( target,
				{ top: 100, right: 200, bottom: 200, left: 100, width: 100, height: 100 } );
			stubRect( targetAncestor,
				{ top: 100, right: 300, bottom: 400, left: 0, width: 300, height: 300 },
				{ scrollLeft: 200, scrollTop: -100 } );
			stubRect( iframe,
				{ top: 200, right: 400, bottom: 400, left: 200, width: 200, height: 200 } );
			stubRect( iframeAncestor,
				{ top: 0, right: 400, bottom: 400, left: 0, width: 400, height: 400 },
				{ scrollLeft: 100, scrollTop: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( targetAncestor, { scrollLeft: 200, scrollTop: -100 } );
			assertScrollPosition( iframeAncestor, { scrollTop: 100, scrollLeft: 100 } );
			sinon.assert.notCalled( iframeWindow.scrollTo );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubRect( target,
				{ top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );
			stubRect( targetAncestor,
				{ top: 200, right: 300, bottom: 400, left: 0, width: 300, height: 100 },
				{ scrollLeft: 200, scrollTop: -100 } );
			stubRect( iframe,
				{ top: 2000, right: 2000, bottom: 2500, left: 2500, width: 500, height: 500 } );
			stubRect( iframeAncestor,
				{ top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100 },
				{ scrollLeft: 100, scrollTop: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( targetAncestor, { scrollTop: -500, scrollLeft: 200 } );
			assertScrollPosition( iframeAncestor, { scrollTop: 1900, scrollLeft: 2700 } );
			sinon.assert.calledWithExactly( iframeWindow.scrollTo, 100, -100 );
			sinon.assert.calledWithExactly( window.scrollTo, 1820, 1520 );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/930
		it( 'should not throw if the child frame has no access to the #frameElement of the parent', () => {
			sinon.stub( iframeWindow, 'frameElement' ).get( () => null );

			expect( () => {
				scrollViewportToShowTarget( { target } );
			} ).to.not.throw();
		} );
	} );

	// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
	// the getBoundingClientRect geometry of the target. That's why scrolling the viewport
	// works like the target remained in the original position. It's tricky but much faster
	// and still shows that the whole thing works as expected.
	//
	// Note: Negative scrollTo arguments make no sense in reality, but in mocks with arbitrary
	// initial geometry and scroll position they give the right, relative picture of what's going on.
	function testNoOffset() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubRect( target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubRect( target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: -100, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -100 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubRect( target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 50, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 50 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubRect( target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 700, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 320 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubRect( target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 550, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 170 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubRect( target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -100 } );
			sinon.assert.calledWithExactly( window.scrollTo, -100, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubRect( target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 50 } );
			sinon.assert.calledWithExactly( window.scrollTo, 50, 100 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubRect( target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 320, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubRect( target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1050 } );
			sinon.assert.calledWithExactly( window.scrollTo, 170, 100 );
		} );
	}

	// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
	// the getBoundingClientRect geometry of the target. That's why scrolling the viewport
	// works like the target remained in the original position. It's tricky but much faster
	// and still shows that the whole thing works as expected.
	//
	// Note: Negative scrollTo arguments make no sense in reality, but in mocks with arbitrary
	// initial geometry and scroll position they give the right, relative picture of what's going on.
	function testWithOffset() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubRect( target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 150, scrollLeft: 200 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubRect( target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -100, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -130 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubRect( target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 50, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 20 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubRect( target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 700, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 350 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubRect( target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 550, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 200 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubRect( target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -100 } );
			sinon.assert.calledWithExactly( window.scrollTo, -130, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubRect( target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 50 } );
			sinon.assert.calledWithExactly( window.scrollTo, 20, 70 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubRect( target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 350, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubRect( target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1050 } );
			sinon.assert.calledWithExactly( window.scrollTo, 200, 70 );
		} );
	}
} );

function stubRect( target, geometryStub, scrollStub ) {
	if ( isRange( target ) ) {
		testUtils.sinon.stub( target, 'getClientRects' ).returns( [ geometryStub ] );
	} else {
		testUtils.sinon.stub( target, 'getBoundingClientRect' ).returns( geometryStub );

		// Make the element immune to the border-width-* styles in the test environment.
		Object.defineProperties( target, {
			offsetWidth: {
				value: geometryStub.width
			},
			clientWidth: {
				value: geometryStub.width
			},
			offsetHeight: {
				value: geometryStub.height
			},
			clientHeight: {
				value: geometryStub.height
			}
		} );
	}

	if ( scrollStub ) {
		let { scrollLeft, scrollTop } = scrollStub;

		// There's no way to stub scrollLeft|Top with Sinon. defineProperties
		// must be used instead.
		Object.defineProperties( target, {
			scrollLeft: {
				get() {
					return scrollLeft;
				},
				set( value ) {
					scrollLeft = value;
				},
				configurable: true
			},
			scrollTop: {
				get() {
					return scrollTop;
				},
				set( value ) {
					scrollTop = value;
				},
				configurable: true
			}
		} );
	}
}

function assertScrollPosition( element, expected ) {
	expect( element.scrollTop ).to.equal( expected.scrollTop, 'scrollTop' );
	expect( element.scrollLeft ).to.equal( expected.scrollLeft, 'scrollLeft' );
}
