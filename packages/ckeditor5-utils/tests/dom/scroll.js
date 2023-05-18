/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global window, document, Text */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { stubGeometry, assertScrollPosition } from '../_utils/scroll';
import { scrollViewportToShowTarget, scrollAncestorsToShowTarget } from '../../src/dom/scroll';

describe( 'scrollAncestorsToShowTarget()', () => {
	let target, element, firstAncestor, secondAncestor;
	const ancestorOffset = 10;

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

		stubGeometry( testUtils, firstAncestor, {
			top: 0, right: 100, bottom: 100, left: 0, width: 100, height: 100
		}, {
			scrollLeft: 100, scrollTop: 100
		} );

		stubGeometry( testUtils, secondAncestor, {
			top: -100, right: 0, bottom: 0, left: -100, width: 100, height: 100
		}, {
			scrollLeft: 100, scrollTop: 100
		} );

		stubGeometry( testUtils, document.body, {
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

		describe( 'without ancestorOffset', () => {
			testWithoutAncestorOffset();
		} );

		describe( 'with ancestorOffset', () => {
			testWithAncestorOffset();
		} );
	} );

	describe( 'for a DOM Range', () => {
		beforeEach( () => {
			target = document.createRange();
			target.setStart( firstAncestor, 0 );
			target.setEnd( firstAncestor, 0 );
		} );

		describe( 'without ancestorOffset', () => {
			testWithoutAncestorOffset();
		} );

		describe( 'with ancestorOffset', () => {
			testWithAncestorOffset();
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (above, attached to the Text)', () => {
			const text = new Text( 'foo' );
			firstAncestor.appendChild( text );
			target.setStart( text, 1 );
			target.setEnd( text, 2 );

			stubGeometry( testUtils, target, { top: -100, right: 75, bottom: 0, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 0, scrollLeft: 100 } );
		} );
	} );

	/* eslint-disable mocha/no-identical-title */

	function testWithoutAncestorOffset() {
		it( 'should not touch the #scrollTop #scrollLeft of the ancestor if target is visible', () => {
			stubGeometry( testUtils, target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollLeft: 100, scrollTop: 100 } );
		} );

		it( 'should not touch the #scrollTop #scrollLeft of the document.body', () => {
			stubGeometry( testUtils, target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( document.body, { scrollLeft: 1000, scrollTop: 1000 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -100, right: 75, bottom: 0, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 0, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 200, right: 75, bottom: 300, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 300, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (left of)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 0, bottom: 100, left: -100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 0 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (right of)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of all the ancestors', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
			// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
			// the getBoundingClientRect geometry of the target. That's why scrolling secondAncestor
			// works like the target remained in the original position and hence scrollLeft is 300 instead
			// of 200.
			assertScrollPosition( secondAncestor, { scrollTop: 200, scrollLeft: 300 } );
		} );
	}

	function testWithAncestorOffset() {
		it( 'should not touch the #scrollTop #scrollLeft of the ancestor if target is visible', () => {
			stubGeometry( testUtils, target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollLeft: 100, scrollTop: 100 } );
		} );

		it( 'should not touch the #scrollTop #scrollLeft of the document.body', () => {
			stubGeometry( testUtils, target, { top: 25, right: 75, bottom: 75, left: 25, width: 50, height: 50 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( document.body, { scrollLeft: 1000, scrollTop: 1000 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -100, right: 75, bottom: 0, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollTop: -10, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 200, right: 75, bottom: 300, left: 25, width: 50, height: 100 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollTop: 310, scrollLeft: 100 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (left of)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 0, bottom: 100, left: -100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -10 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of the ancestor to show the target (right of)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 210 } );
		} );

		it( 'should set #scrollTop and #scrollLeft of all the ancestors', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollAncestorsToShowTarget( target, ancestorOffset );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 210 } );
			// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
			// the getBoundingClientRect geometry of the target. That's why scrolling secondAncestor
			// works like the target remained in the original position and hence scrollLeft is 300 instead
			// of 200.
			assertScrollPosition( secondAncestor, { scrollTop: 210, scrollLeft: 310 } );
		} );
	}

	/* eslint-enable mocha/no-identical-title */
} );

describe( 'scrollViewportToShowTarget()', () => {
	let target, firstAncestor, element;
	const viewportOffset = 30;
	const ancestorOffset = 10;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'p' );
		firstAncestor = document.createElement( 'blockquote' );

		document.body.appendChild( firstAncestor );
		firstAncestor.appendChild( element );

		stubGeometry( testUtils, firstAncestor, {
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

		describe( 'with no options', () => {
			testNoConfig();
		} );

		describe( 'with a viewportOffset', () => {
			testWithViewportOffset();
		} );

		describe( 'with an ancestorOffset', () => {
			testWithAncestorOffset();
		} );

		describe( 'with viewportOffset and ancestorOffset', () => {
			testWithViewportAndAncestorOffsets();
		} );

		describe( 'with alignToTop and no offsets', () => {
			testWithAlignToTopAndNoOffsets();
		} );

		describe( 'with alignToTop and offsets', () => {
			testWithAlignToTopAndOffsets();
		} );

		describe( 'with alignToTop, offsets, and forceScroll', () => {
			testWithAlignToTopOffsetsAndForceScroll();
		} );
	} );

	describe( 'for a DOM Range', () => {
		beforeEach( () => {
			target = document.createRange();
			target.setStart( firstAncestor, 0 );
			target.setEnd( firstAncestor, 0 );
		} );

		describe( 'with no options', () => {
			testNoConfig();
		} );

		describe( 'with a viewportOffset', () => {
			testWithViewportOffset();
		} );

		describe( 'with an ancestorOffset', () => {
			testWithAncestorOffset();
		} );

		describe( 'with viewportOffset and ancestorOffset', () => {
			testWithViewportAndAncestorOffsets();
		} );

		describe( 'with alignToTop and no offsets', () => {
			testWithAlignToTopAndNoOffsets();
		} );

		describe( 'with alignToTop and offsets', () => {
			testWithAlignToTopAndOffsets();
		} );

		describe( 'with alignToTop, offsets, and forceScroll', () => {
			testWithAlignToTopOffsetsAndForceScroll();
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
			stubGeometry( testUtils, target,
				{ top: 100, right: 200, bottom: 200, left: 100, width: 100, height: 100 } );
			stubGeometry( testUtils, targetAncestor,
				{ top: 100, right: 300, bottom: 400, left: 0, width: 300, height: 300 },
				{ scrollLeft: 200, scrollTop: -100 } );
			stubGeometry( testUtils, iframe,
				{ top: 200, right: 400, bottom: 400, left: 200, width: 200, height: 200 } );
			stubGeometry( testUtils, iframeAncestor,
				{ top: 0, right: 400, bottom: 400, left: 0, width: 400, height: 400 },
				{ scrollLeft: 100, scrollTop: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( targetAncestor, { scrollLeft: 200, scrollTop: -100 } );
			assertScrollPosition( iframeAncestor, { scrollTop: 100, scrollLeft: 100 } );
			sinon.assert.notCalled( iframeWindow.scrollTo );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target,
				{ top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );
			stubGeometry( testUtils, targetAncestor,
				{ top: 200, right: 300, bottom: 400, left: 0, width: 300, height: 100 },
				{ scrollLeft: 200, scrollTop: -100 } );
			stubGeometry( testUtils, iframe,
				{ top: 2000, right: 2000, bottom: 2500, left: 2500, width: 500, height: 500 } );
			stubGeometry( testUtils, iframeAncestor,
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

	/* eslint-disable mocha/no-identical-title */

	// Note: Because everything is a mock, scrolling the firstAncestor doesn't really change
	// the getBoundingClientRect geometry of the target. That's why scrolling the viewport
	// works like the target remained in the original position. It's tricky but much faster
	// and still shows that the whole thing works as expected.
	//
	// Note: Negative scrollTo arguments make no sense in reality, but in mocks with arbitrary
	// initial geometry and scroll position they give the right, relative picture of what's going on.
	function testNoConfig() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: -100, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -100 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 50, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 50 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 700, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 320 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 550, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 170 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -100 } );
			sinon.assert.calledWithExactly( window.scrollTo, -100, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 50 } );
			sinon.assert.calledWithExactly( window.scrollTo, 50, 100 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 320, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1050 } );
			sinon.assert.calledWithExactly( window.scrollTo, 170, 100 );
		} );
	}

	function testWithViewportOffset() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 150, scrollLeft: 200 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -100, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -130 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 50, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 20 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 700, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 350 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 550, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 200 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -100 } );
			sinon.assert.calledWithExactly( window.scrollTo, -130, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 50 } );
			sinon.assert.calledWithExactly( window.scrollTo, 20, 70 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 350, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1050 } );
			sinon.assert.calledWithExactly( window.scrollTo, 200, 70 );
		} );
	}

	function testWithAncestorOffset() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 160, scrollLeft: 210 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -110, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -100 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 40, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 50 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 710, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 320 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 560, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 170 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -110 } );
			sinon.assert.calledWithExactly( window.scrollTo, -100, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 40 } );
			sinon.assert.calledWithExactly( window.scrollTo, 50, 100 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 320, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1060 } );
			sinon.assert.calledWithExactly( window.scrollTo, 170, 100 );
		} );
	}

	function testWithViewportAndAncestorOffsets() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 160, scrollLeft: 210 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -110, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -130 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 40, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 20 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 710, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 350 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 560, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 200 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -110 } );
			sinon.assert.calledWithExactly( window.scrollTo, -130, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 40 } );
			sinon.assert.calledWithExactly( window.scrollTo, 20, 70 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 350, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1060 } );
			sinon.assert.calledWithExactly( window.scrollTo, 200, 70 );
		} );
	}

	function testWithAlignToTopAndNoOffsets() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 0, right: 200, bottom: 100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 200 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: -100, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -100 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 50, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 50 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 700, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 700 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 550, scrollLeft: 200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 550 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -100 } );
			sinon.assert.calledWithExactly( window.scrollTo, -100, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 50 } );
			sinon.assert.calledWithExactly( window.scrollTo, 50, 100 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1200 } );
			sinon.assert.calledWithExactly( window.scrollTo, 320, 100 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1050 } );
			sinon.assert.calledWithExactly( window.scrollTo, 170, 100 );
		} );
	}

	function testWithAlignToTopAndOffsets() {
		it( 'does not scroll the viewport when the target is fully visible', () => {
			stubGeometry( testUtils, target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 140, scrollLeft: 210 } );
			sinon.assert.notCalled( window.scrollTo );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -110, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -130 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 40, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 20 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 690, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 670 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 540, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 520 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: -110 } );
			sinon.assert.calledWithExactly( window.scrollTo, -130, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 40 } );
			sinon.assert.calledWithExactly( window.scrollTo, 20, 70 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 350, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 100, scrollLeft: 1060 } );
			sinon.assert.calledWithExactly( window.scrollTo, 200, 70 );
		} );
	}

	function testWithAlignToTopOffsetsAndForceScroll() {
		it( 'should scroll the viewport despite the target being fully visible', () => {
			stubGeometry( testUtils, target, { top: 50, right: 200, bottom: 150, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 140, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 120 );
		} );

		it( 'scrolls the viewport to show the target (above)', () => {
			stubGeometry( testUtils, target, { top: -200, right: 200, bottom: -100, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: -110, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, -130 );
		} );

		it( 'scrolls the viewport to show the target (partially above)', () => {
			stubGeometry( testUtils, target, { top: -50, right: 200, bottom: 50, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 40, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 20 );
		} );

		it( 'scrolls the viewport to show the target (below)', () => {
			stubGeometry( testUtils, target, { top: 600, right: 200, bottom: 700, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 690, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 670 );
		} );

		it( 'scrolls the viewport to show the target (partially below)', () => {
			stubGeometry( testUtils, target, { top: 450, right: 200, bottom: 550, left: 100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 540, scrollLeft: 210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 100, 520 );
		} );

		it( 'scrolls the viewport to show the target (to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: -100, bottom: 100, left: -200, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 90, scrollLeft: -110 } );
			sinon.assert.calledWithExactly( window.scrollTo, -130, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the left)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 50, bottom: 100, left: -50, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 90, scrollLeft: 40 } );
			sinon.assert.calledWithExactly( window.scrollTo, 20, 70 );
		} );

		it( 'scrolls the viewport to show the target (to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1200, bottom: 100, left: 1100, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 90, scrollLeft: 1210 } );
			sinon.assert.calledWithExactly( window.scrollTo, 350, 70 );
		} );

		it( 'scrolls the viewport to show the target (partially to the right)', () => {
			stubGeometry( testUtils, target, { top: 0, right: 1050, bottom: 100, left: 950, width: 100, height: 100 } );

			scrollViewportToShowTarget( { target, alignToTop: true, forceScroll: true, viewportOffset, ancestorOffset } );
			assertScrollPosition( firstAncestor, { scrollTop: 90, scrollLeft: 1060 } );
			sinon.assert.calledWithExactly( window.scrollTo, 200, 70 );
		} );
	}

	/* eslint-enable mocha/no-identical-title */
} );
