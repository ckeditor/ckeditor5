/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import { getOptimalPosition } from '../../src/dom/position';
import Rect from '../../src/dom/rect';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

let element, target, limiter;

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
const attachRight = targetRect => ( {
	top: targetRect.top,
	left: targetRect.left + targetRect.width,
	name: 'right'
} );

//	+-----+
//	|  T  |
//	+-----+--+
//	|    E   |
//	+--------+
const attachBottom = targetRect => ( {
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

describe( 'getOptimalPosition()', () => {
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'getComputedStyle' );

		stubWindow( {
			innerWidth: 10000,
			innerHeight: 10000,
			scrollX: 0,
			scrollY: 0
		} );
	} );

	it( 'should work when the target is a Function', () => {
		setElementTargetPlayground();

		assertPosition( {
			element,
			target: () => target,
			positions: [ attachLeft ]
		}, {
			top: 100,
			left: 80,
			name: 'left'
		} );
	} );

	it( 'should work when the target is a Rect', () => {
		setElementTargetPlayground();

		assertPosition( {
			element,
			target: new Rect( target ),
			positions: [ attachLeft ]
		}, {
			top: 100,
			left: 80,
			name: 'left'
		} );
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
			stubWindow( {
				innerWidth: 10000,
				innerHeight: 10000,
				scrollX: 100,
				scrollY: 100
			} );

			assertPosition( { element, target, positions: [ attachLeft ] }, {
				top: 200,
				left: 180,
				name: 'left'
			} );
		} );

		describe( 'positioned element parent', () => {
			let parent;

			it( 'should return coordinates', () => {
				stubWindow( {
					innerWidth: 10000,
					innerHeight: 10000,
					scrollX: 1000,
					scrollY: 1000
				} );

				parent = getElement( {
					top: 1000,
					right: 1010,
					bottom: 1010,
					left: 1000,
					width: 10,
					height: 10
				}, {
					position: 'absolute'
				} );

				element.parentElement = parent;

				assertPosition( { element, target, positions: [ attachLeft ] }, {
					top: -900,
					left: -920,
					name: 'left'
				} );
			} );

			it( 'should return coordinates (scroll and border)', () => {
				stubWindow( {
					innerWidth: 10000,
					innerHeight: 10000,
					scrollX: 1000,
					scrollY: 1000
				} );

				parent = getElement( {
					top: 0,
					right: 10,
					bottom: 10,
					left: 0,
					width: 10,
					height: 10,
					scrollTop: 100,
					scrollLeft: 200
				}, {
					position: 'absolute',
					borderLeftWidth: '20px',
					borderTopWidth: '40px'
				} );

				element.parentElement = parent;

				assertPosition( { element, target, positions: [ attachLeft ] }, {
					top: 160,
					left: 260,
					name: 'left'
				} );
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

		it( 'should work when the limiter is a Function', () => {
			assertPosition( {
				element, target,
				limiter: () => limiter,
				positions: [ attachLeft, attachRight ]
			}, {
				top: 100,
				left: -20,
				name: 'left'
			} );
		} );

		it( 'should work when the limiter is a Rect', () => {
			assertPosition( {
				element, target,
				limiter: new Rect( limiter ),
				positions: [ attachLeft, attachRight ]
			}, {
				top: 100,
				left: -20,
				name: 'left'
			} );
		} );

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

		// https://github.com/ckeditor/ckeditor5-utils/issues/148
		it( 'should return coordinates (#3)', () => {
			limiter.parentNode = getElement( {
				top: 100,
				left: 0,
				bottom: 110,
				right: 10,
				width: 10,
				height: 10
			} );

			assertPosition( {
				element, target, limiter,
				positions: [ attachRight, attachLeft ]
			}, {
				top: 100,
				left: 10,
				name: 'right'
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
			limiter = getElement( {
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

// Returns a synthetic element.
//
// @private
// @param {Object} properties A set of properties for the element.
// @param {Object} styles A set of styles in `window.getComputedStyle()` format.
function getElement( properties = {}, styles = {} ) {
	const element = {
		tagName: 'div',
		scrollLeft: 0,
		scrollTop: 0,
		ownerDocument: document
	};

	Object.assign( element, properties );

	if ( !styles.borderLeftWidth ) {
		styles.borderLeftWidth = '0px';
	}

	if ( !styles.borderTopWidth ) {
		styles.borderTopWidth = '0px';
	}

	window.getComputedStyle.withArgs( element ).returns( styles );

	return element;
}

// Stubs the window.
//
// @private
// @param {Object} properties A set of properties the window should have.
function stubWindow( properties ) {
	for ( const p in properties ) {
		testUtils.sinon.stub( window, p ).value( properties[ p ] );
	}
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
	element = getElement( {
		top: 0,
		right: 20,
		bottom: 20,
		left: 0,
		width: 20,
		height: 20
	} );

	target = getElement( {
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
	element = getElement( {
		top: 0,
		right: 20,
		bottom: 20,
		left: 0,
		width: 20,
		height: 20
	} );

	limiter = getElement( {
		top: 100,
		right: 10,
		bottom: 120,
		left: -10,
		width: 20,
		height: 20
	} );

	target = getElement( {
		top: 100,
		right: 10,
		bottom: 110,
		left: 0,
		width: 10,
		height: 10
	} );
}
