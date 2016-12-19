/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import global from 'ckeditor5/utils/dom/global.js';
import { getOptimalPosition } from 'ckeditor5/utils/dom/position.js';
import testUtils from 'tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

const window = global.window;
let element, target, limiter;

describe( 'getOptimalPosition', () => {
	beforeEach( () => {
		// Give us a lot of space.
		testUtils.sinon.stub( window, 'innerWidth', 10000 );
		testUtils.sinon.stub( window, 'innerHeight', 10000 );

		testUtils.sinon.stub( window, 'scrollX', 0 );
		testUtils.sinon.stub( window, 'scrollY', 0 );
	} );

	describe( 'for single position', () => {
		beforeEach( setElementTargetPlayground );

		it( 'should return coordinates', () => {
			assertPosition( { element, target, positions: [ attachLeft ] }, {
				top: 100,
				left: 80,
				name: 'left'
			} );
		} );

		it( 'should return coordinates (window scroll)', () => {
			testUtils.sinon.stub( window, 'scrollX', 100 );
			testUtils.sinon.stub( window, 'scrollY', 100 );

			assertPosition( { element, target, positions: [ attachLeft ] }, {
				top: 200,
				left: 180,
				name: 'left'
			} );
		} );

		it( 'should return coordinates (positioned element parent)', () => {
			const positionedParent = document.createElement( 'div' );

			testUtils.sinon.stub( window, 'scrollX', 1000 );
			testUtils.sinon.stub( window, 'scrollY', 1000 );

			Object.assign( positionedParent.style, {
				position: 'absolute',
				top: '1000px',
				left: '1000px'
			} );

			document.body.appendChild( positionedParent );
			positionedParent.appendChild( element );

			stubElementRect( positionedParent, {
				top: 1000,
				right: 1010,
				bottom: 1010,
				left: 1000,
				width: 10,
				height: 10
			} );

			assertPosition( { element, target, positions: [ attachLeft ] }, {
				top: -900,
				left: -920,
				name: 'left'
			} );
		} );
	} );

	describe( 'for multiple positions', () => {
		beforeEach( setElementTargetPlayground );

		it( 'should return coordinates', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeft, attachRight ]
			}, {
				top: 100,
				left: 80,
				name: 'left'
			} );
		} );

		it( 'should return coordinates (position preference order)', () => {
			assertPosition( {
				element, target,
				positions: [ attachRight, attachLeft ]
			}, {
				top: 100,
				left: 110,
				name: 'right'
			} );
		} );
	} );

	describe( 'with a limiter', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeft, attachRight ]
			}, {
				top: 100,
				left: -20,
				name: 'left'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRight, attachLeft ]
			}, {
				top: 100,
				left: -20,
				name: 'left'
			} );
		} );
	} );

	describe( 'with fitInViewport on', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeft, attachRight ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target,
				positions: [ attachRight, attachLeft ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );

		it( 'should return coordinates (#3)', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeft, attachBottom, attachRight ],
				fitInViewport: true
			}, {
				top: 110,
				left: 0,
				name: 'bottom'
			} );
		} );
	} );

	describe( 'with limiter and fitInViewport on', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeft, attachRight ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRight, attachLeft ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );

		it( 'should return coordinates (#3)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRight, attachLeft, attachBottom ],
				fitInViewport: true
			}, {
				top: 110,
				left: 0,
				name: 'bottom'
			} );
		} );

		it( 'should return coordinates (#4)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachTop, attachRight ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );

		it( 'should return the very first coordinates if no fitting position with a positive intersection has been found', () => {
			assertPosition( {
				element, target, limiter,
				positions: [
					() => ( {
						left: -10000,
						top: -10000,
						name: 'no-intersect-position'
					} )
				],
				fitInViewport: true
			}, {
				left: -10000,
				top: -10000,
				name: 'no-intersect-position'
			} );
		} );

		it( 'should return the very first coordinates if limiter does not fit into the viewport', () => {
			stubElementRect( limiter, {
				top: -100,
				right: -80,
				bottom: -80,
				left: -100,
				width: 20,
				height: 20
			} );

			assertPosition( {
				element, target, limiter,
				positions: [ attachRight, attachTop ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right'
			} );
		} );
	} );
} );

function assertPosition( options, expected ) {
	const position = getOptimalPosition( options );

	expect( position ).to.deep.equal( expected );
}

//	+--------+-----+
//	|    E   |  T  |
//	+--------+-----+
const attachLeft = ( targetRect, elementRect ) => ( {
	top: targetRect.top,
	left: targetRect.left - elementRect.width,
	name: 'left'
} );

//	+-----+--------+
//	|  T  |    E   |
//	+-----+--------+
const attachRight = ( targetRect ) => ( {
	top: targetRect.top,
	left: targetRect.left + targetRect.width,
	name: 'right'
} );

//	+-----+
//	|  T  |
//	+-----+--+
//	|    E   |
//	+--------+
const attachBottom = ( targetRect ) => ( {
	top: targetRect.bottom,
	left: targetRect.left,
	name: 'bottom'
} );

//	+--------+
//	|    E   |
//	+--+-----+
//	   |  T  |
//	   +-----+
const attachTop = ( targetRect, elementRect ) => ( {
	top: targetRect.top - elementRect.height,
	left: targetRect.left - ( elementRect.width - targetRect.width ),
	name: 'bottom'
} );

function stubElementRect( element, rect ) {
	if ( element.getBoundingClientRect.restore ) {
		element.getBoundingClientRect.restore();
	}

	testUtils.sinon.stub( element, 'getBoundingClientRect' ).returns( rect );
}

//        <-- 100px ->
//
//    ^   +--------------[ Viewport ]----------
//    |   |
//  100px |
//	  |   |           <-- 10px -->
//	  V   |
//	      |      ^    +---------+
//	      |      |    |         |
//	      |     10px  |    T    |
//	      |      |    |         |
//	      |      V    +---------+
//	      |
//
function setElementTargetPlayground() {
	element = document.createElement( 'div' );
	target = document.createElement( 'div' );

	stubElementRect( element, {
		top: 0,
		right: 20,
		bottom: 20,
		left: 0,
		width: 20,
		height: 20
	} );

	stubElementRect( target, {
		top: 100,
		right: 110,
		bottom: 110,
		left: 100,
		width: 10,
		height: 10
	} );
}

//
//
//     ^                +-----------[ Viewport ]----------------------
//     |                |
//   100px              |
//     |   <--------- 20px ------->
//	   |               <-- 10px -->
//	   V                |
//	       +------------+---------+  ^    ^
//	       |            |         |  |    |
//	       |            |    T    | 10px  |
//	       |            |         |  |    |
//	       |            +---------+  V   20px
//	       |            |         |       |
//	       |            |         |       |
//	       |            |         |       |
//         +------[ Limiter ]-----+       V
//                      |
//                      |
//
//
function setElementTargetLimiterPlayground() {
	element = document.createElement( 'div' );
	target = document.createElement( 'div' );
	limiter = document.createElement( 'div' );

	stubElementRect( element, {
		top: 0,
		right: 20,
		bottom: 20,
		left: 0,
		width: 20,
		height: 20
	} );

	stubElementRect( limiter, {
		top: 100,
		right: 10,
		bottom: 120,
		left: -10,
		width: 20,
		height: 20
	} );

	stubElementRect( target, {
		top: 100,
		right: 10,
		bottom: 110,
		left: 0,
		width: 10,
		height: 10
	} );
}
