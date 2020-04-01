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
//	|        |-----+
//  +--------+
const attachLeftBottom = ( targetRect, elementRect ) => ( {
	top: targetRect.top,
	left: targetRect.left - elementRect.width,
	name: 'left-bottom'
} );

//	+--------+
//	|    E   |-----+
//	|        |  T  |
//  +--------+-----+
const attachLeftTop = ( targetRect, elementRect ) => ( {
	top: targetRect.bottom - elementRect.height,
	left: targetRect.left - elementRect.width,
	name: 'left-top'
} );

//	+-----+--------+
//	|  T  |    E   |
//	+-----|        |
//        +--------+
const attachRightBottom = targetRect => ( {
	top: targetRect.top,
	left: targetRect.right,
	name: 'right-bottom'
} );

//	      +--------+
//	+-----|    E   |
//	|  T  |        |
//  +-----+--------+
const attachRightTop = ( targetRect, elementRect ) => ( {
	top: targetRect.bottom - elementRect.height,
	left: targetRect.right,
	name: 'right-top'
} );

//	+-----+
//	|  T  |
//	+-----+--+
//	|    E   |
//	+--------+
const attachBottomRight = targetRect => ( {
	top: targetRect.bottom,
	left: targetRect.left,
	name: 'bottom-right'
} );

//	   +-----+
//	   |  T  |
//	+--+-----+
//	|    E   |
//	+--------+
const attachBottomLeft = ( targetRect, elementRect ) => ( {
	top: targetRect.bottom,
	left: targetRect.right - elementRect.width,
	name: 'bottom-left'
} );

//	+--------+
//	|    E   |
//	+--+-----+
//	   |  T  |
//	   +-----+
const attachTopLeft = ( targetRect, elementRect ) => ( {
	top: targetRect.top - elementRect.height,
	left: targetRect.right - elementRect.width,
	name: 'top-left'
} );

//	+--------+
//	|   E    |
//	+-----+--+
//	|  T  |
//	+-----+
const attachTopRight = ( targetRect, elementRect ) => ( {
	top: targetRect.top - elementRect.height,
	left: targetRect.left,
	name: 'top-right'
} );

const allPositions = [
	attachLeftBottom,
	attachLeftTop,
	attachRightBottom,
	attachRightTop,
	attachBottomRight,
	attachBottomLeft,
	attachTopLeft,
	attachTopRight
];

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
			positions: [ attachLeftBottom ]
		}, {
			top: 100,
			left: 80,
			name: 'left-bottom'
		} );
	} );

	it( 'should work when the target is a Rect', () => {
		setElementTargetPlayground();

		assertPosition( {
			element,
			target: new Rect( target ),
			positions: [ attachLeftBottom ]
		}, {
			top: 100,
			left: 80,
			name: 'left-bottom'
		} );
	} );

	describe( 'for single position', () => {
		beforeEach( setElementTargetPlayground );

		it( 'should return coordinates', () => {
			assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
				top: 100,
				left: 80,
				name: 'left-bottom'
			} );
		} );

		it( 'should return coordinates (window scroll)', () => {
			stubWindow( {
				innerWidth: 10000,
				innerHeight: 10000,
				scrollX: 100,
				scrollY: 100
			} );

			assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
				top: 200,
				left: 180,
				name: 'left-bottom'
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

				assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
					top: -900,
					left: -920,
					name: 'left-bottom'
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

				assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
					top: 160,
					left: 260,
					name: 'left-bottom'
				} );
			} );
		} );
	} );

	describe( 'for multiple positions', () => {
		beforeEach( setElementTargetPlayground );

		it( 'should return coordinates', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: 80,
				name: 'left-bottom'
			} );
		} );

		it( 'should return coordinates (position preference order)', () => {
			assertPosition( {
				element, target,
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: 110,
				name: 'right-bottom'
			} );
		} );
	} );

	describe( 'with a limiter', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should work when the limiter is a Function', () => {
			assertPosition( {
				element, target,
				limiter: () => limiter,
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: -20,
				name: 'left-bottom'
			} );
		} );

		it( 'should work when the limiter is a Rect', () => {
			assertPosition( {
				element, target,
				limiter: new Rect( limiter ),
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: -20,
				name: 'left-bottom'
			} );
		} );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: -20,
				name: 'left-bottom'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: -20,
				name: 'left-bottom'
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
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return the first position that completely fits in the limiter', () => {
			element = getElement( {
				top: 0,
				right: 5,
				bottom: 5,
				left: 0,
				width: 5,
				height: 5
			} );
			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: -5,
				name: 'left-bottom'
			} );
		} );
	} );

	describe( 'with fitInViewport on', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeftBottom, attachRightBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target,
				positions: [ attachRightBottom, attachLeftBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#3)', () => {
			assertPosition( {
				element, target,
				positions: [ attachLeftBottom, attachBottomRight, attachRightBottom ],
				fitInViewport: true
			}, {
				top: 110,
				left: 0,
				name: 'bottom-right'
			} );
		} );
	} );

	describe( 'with limiter and fitInViewport on', () => {
		beforeEach( setElementTargetLimiterPlayground );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeftBottom, attachRightBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#3)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom, attachBottomRight ],
				fitInViewport: true
			}, {
				top: 110,
				left: 0,
				name: 'bottom-right'
			} );
		} );

		it( 'should return coordinates (#4)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachTopLeft, attachRightBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
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
				positions: [ attachRightBottom, attachTopLeft ],
				fitInViewport: true
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should prefer positions fitting entirely into the viewport', () => {
			target = getElement( {
				top: 100,
				right: 35,
				bottom: 120,
				left: 15,
				width: 20,
				height: 20
			} );
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeftBottom, attachRightBottom ],
				fitInViewport: true
			}, {
				top: 100,
				left: 35,
				name: 'right-bottom'
			} );
		} );
	} );

	describe( 'maximizes intersection area with both limiter and viewport', () => {
		beforeEach( setElementTargetBigLimiterPlayground );

		it( 'should prefer a position with a bigger intersection area (#1)', () => {
			target = getElement( {
				top: 90,
				right: -10,
				bottom: 110,
				left: -30,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'right-bottom' );
		} );

		it( 'should prefer a position with a bigger intersection area (#2)', () => {
			target = getElement( {
				top: 290,
				right: -10,
				bottom: 310,
				left: -30,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'right-top' );
		} );

		it( 'should prefer a position with a bigger intersection area (#3)', () => {
			target = getElement( {
				top: 90,
				right: 130,
				bottom: 110,
				left: 110,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'left-bottom' );
		} );

		it( 'should prefer a position with a bigger intersection area (#4)', () => {
			target = getElement( {
				top: 290,
				right: 130,
				bottom: 310,
				left: 110,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'left-top' );
		} );

		it( 'should not stick to the first biggest intersection in one area', () => {
			// First position intersects more with limiter but little with viewport,
			// second position intersects less with limiter but more with viewport and it should not be ignored.
			//
			// Target is outside viewport to force checking all positions, not only those completely fitting in viewport.
			limiter = getElement( {
				top: -100,
				right: 100,
				bottom: 100,
				left: -100,
				width: 200,
				height: 200
			} );
			target = getElement( {
				top: -30,
				right: 80,
				bottom: -10,
				left: 60,
				width: 20,
				height: 20
			} );
			element = getElement( {
				top: 0,
				right: 200,
				bottom: 200,
				left: 0,
				width: 200,
				height: 200
			} );
			assertPositionName( {
				element, target, limiter,
				positions: [
					attachLeftBottom,
					attachRightBottom
				],
				fitInViewport: true
			}, 'right-bottom' );
		} );
	} );
} );

function assertPosition( options, expected ) {
	const position = getOptimalPosition( options );

	expect( position ).to.deep.equal( expected );
}

function assertPositionName( options, expected ) {
	const position = getOptimalPosition( options );

	expect( position.name ).to.equal( expected );
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

	expect( properties.right - properties.left ).to.equal( properties.width, 'getElement incorrect horizontal values' );
	expect( properties.bottom - properties.top ).to.equal( properties.height, 'getElement incorrect vertical values' );

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

//
//
//     ^                +-----------[ Viewport ]----------------------
//     |                |
//   100px              |
//     |   <--------- 200px ------->
//	   |               <-- 100px -->
//	   V                |
//	       +------------+---------+     ^
//	       |            |         |     |
//	       |            |         |     |
//	       |            |         |     |
//	       |            |         |    200px
//	       |            |         |     |
//	       |            |         |     |
//	       |            |         |     |
//         +------[ Limiter ]-----+     V
//                      |
//                      |
//
//
function setElementTargetBigLimiterPlayground() {
	element = getElement( {
		top: 0,
		right: 50,
		bottom: 50,
		left: 0,
		width: 50,
		height: 50
	} );

	limiter = getElement( {
		top: 100,
		right: 100,
		bottom: 300,
		left: -100,
		width: 200,
		height: 200
	} );
}
