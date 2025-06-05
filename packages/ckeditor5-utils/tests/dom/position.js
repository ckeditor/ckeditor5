/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getOptimalPosition } from '../../src/dom/position.js';
import Rect from '../../src/dom/rect.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

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

const attachNone = () => null;

const attachWithoutArrow = () => ( {
	top: 0,
	left: 0,
	name: 'arowless',
	config: {
		withArrow: false
	}
} );

const allPositions = [
	attachLeftBottom,
	attachLeftTop,
	attachRightBottom,
	attachRightTop,
	attachBottomRight,
	attachBottomLeft,
	attachTopLeft,
	attachTopRight,
	attachNone
];

describe( 'getOptimalPosition()', () => {
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( window, 'getComputedStyle' );
		window.getComputedStyle.callThrough();

		stubWindow( {
			innerWidth: 10000,
			innerHeight: 10000,
			scrollX: 0,
			scrollY: 0
		} );
	} );

	afterEach( () => {
		if ( element ) {
			element.remove();
		}

		if ( target ) {
			target.remove();
		}

		if ( limiter ) {
			limiter.remove();
		}
	} );

	it( 'should pass position config to the Position object', () => {
		setElementTargetPlayground();

		const position = getOptimalPosition( {
			element,
			target: () => target,
			positions: [ attachWithoutArrow ]
		} );

		expect( position.config ).to.be.an( 'object' );
		expect( position.config.withArrow ).to.be.false;
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

	it( 'should work when the target is a Range', () => {
		setElementTargetPlayground();

		const range = document.createRange();

		range.selectNode( document.body );

		assertPosition( {
			element,
			target: range,
			positions: [ attachLeftBottom ]
		}, {
			top: 8,
			left: -12,
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

			afterEach( () => {
				parent.remove();
			} );

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

				parent.appendChild( element );

				assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
					top: 100,
					left: 80,
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
					height: 10
				}, {
					position: 'absolute',
					borderLeftWidth: '20px',
					borderTopWidth: '40px',
					overflow: 'scroll',
					width: '10px',
					height: '10px',
					background: 'red'
				} );

				Object.assign( element.style, {
					width: '20px',
					height: '20px',
					marginTop: '100px',
					marginLeft: '200px',
					background: 'green'
				} );

				parent.appendChild( element );
				document.body.appendChild( parent );

				parent.scrollLeft = 200;
				parent.scrollTop = 100;

				assertPosition( { element, target, positions: [ attachLeftBottom ] }, {
					top: 1200,
					left: 1280,
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

		it( 'should allow position function to return null to be ignored', () => {
			assertPosition( {
				element, target,
				positions: [ attachRightBottom ]
			}, {
				top: 100,
				left: 110,
				name: 'right-bottom'
			} );
		} );
	} );

	describe( 'with a limiter', () => {
		beforeEach( setElementTargetLimiterPlayground );

		afterEach( () => {
			limiter.remove();
		} );

		it( 'should work when the limiter is a Function', () => {
			assertPosition( {
				element, target,
				limiter: () => limiter,
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should work when the limiter is a Rect', () => {
			assertPosition( {
				element, target,
				limiter: new Rect( limiter ),
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#1)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachLeftBottom, attachRightBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		it( 'should return coordinates (#2)', () => {
			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );
		} );

		// https://github.com/ckeditor/ckeditor5-utils/issues/148
		it( 'should return coordinates (#3)', () => {
			const parentNode = getElement( {
				top: 100,
				left: 0,
				bottom: 110,
				right: 10,
				width: 10,
				height: 10
			} );

			parentNode.appendChild( limiter );
			document.body.appendChild( parentNode );

			assertPosition( {
				element, target, limiter,
				positions: [ attachRightBottom, attachLeftBottom ]
			}, {
				top: 100,
				left: 10,
				name: 'right-bottom'
			} );

			parentNode.remove();
		} );

		it( 'should return the first position that completely fits in the limiter', () => {
			const element = getElement( {
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
				left: 10,
				name: 'right-bottom'
			} );

			element.remove();
		} );

		it( 'should allow position function to return null to be ignored', () => {
			assertNullPosition( {
				element, target, limiter,
				positions: [ attachLeftBottom, attachNone ]
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
			assertNullPosition( {
				element, target, limiter,
				positions: [
					() => ( {
						left: -10000,
						top: -10000,
						name: 'no-intersect-position'
					} )
				],
				fitInViewport: true
			} );
		} );

		it( 'should return the last coordinates if limiter does not fit into the viewport', () => {
			const limiter = getElement( {
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

			limiter.remove();
		} );

		it( 'should prefer positions fitting entirely into the viewport', () => {
			const target = getElement( {
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

			target.remove();
		} );
	} );

	describe( 'optimisation in the context of both the limiter and the viewport', () => {
		beforeEach( setElementTargetBigLimiterPlayground );

		it( 'should prefer a position with a bigger intersection area (#1)', () => {
			target = getElement( {
				top: 90,
				right: 10,
				bottom: 110,
				left: -10,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'bottom-right' );
		} );

		it( 'should prefer a position with a bigger intersection area (#2)', () => {
			target = getElement( {
				top: 290,
				right: 10,
				bottom: 310,
				left: -10,
				width: 20,
				height: 20
			} );
			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'top-right' );
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
	} );

	describe( 'with scrollable ancestors', () => {
		let parentWithOverflow, limiter, target, element, parentAncestorWithOverflow;

		beforeEach( () => {
			limiter = getElement( {
				top: -100,
				right: 100,
				bottom: 100,
				left: -100,
				width: 200,
				height: 200
			} );

			target = getElement( {
				top: 0,
				right: 50,
				bottom: 50,
				left: 0,
				width: 50,
				height: 50
			} );

			element = getElement( {
				top: 0,
				right: 200,
				bottom: 200,
				left: 0,
				width: 200,
				height: 200
			} );

			parentWithOverflow = getElement( {
				top: 0,
				left: 0,
				right: 100,
				bottom: 100,
				width: 100,
				height: 100
			} );
			parentWithOverflow.style.overflow = 'scroll';
		} );

		afterEach( () => {
			if ( element ) {
				element.remove();
			}

			if ( target ) {
				target.remove();
			}

			if ( limiter ) {
				limiter.remove();
			}

			if ( parentWithOverflow ) {
				parentWithOverflow.remove();
			}

			if ( parentAncestorWithOverflow ) {
				parentAncestorWithOverflow.remove();
			}
		} );

		it( 'should return null when target is not visible', () => {
			const target = getElement( {
				top: -200,
				right: -100,
				bottom: -100,
				left: -200,
				width: 100,
				height: 100
			} );
			limiter.appendChild( target );
			parentWithOverflow.appendChild( limiter );
			parentWithOverflow.appendChild( element );
			document.body.appendChild( parentWithOverflow );

			assertNullPosition( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			} );

			parentWithOverflow.remove();
		} );

		it( 'should return position when element is fully contained by the limiter', () => {
			const limiter = getElement( {
				top: 0,
				right: 1000,
				bottom: 1000,
				left: 0,
				width: 1000,
				height: 1000
			} );
			const target = getElement( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const parentWithOverflow = getElement( {
				top: 0,
				left: 0,
				right: 1000,
				bottom: 1000,
				width: 1000,
				height: 1000
			} );

			limiter.appendChild( target );
			parentWithOverflow.appendChild( limiter );
			parentWithOverflow.appendChild( element );
			document.body.appendChild( parentWithOverflow );

			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'right-bottom' );

			parentWithOverflow.remove();
		} );

		it( 'should return position when element is fully contained by the limiter and cropped by top offset', () => {
			const limiter = getElement( {
				top: 0,
				right: 1000,
				bottom: 1000,
				left: 0,
				width: 1000,
				height: 1000
			} );
			const target = getElement( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const parentWithOverflow = getElement( {
				top: 0,
				left: 0,
				right: 1000,
				bottom: 1000,
				width: 1000,
				height: 1000
			} );

			limiter.appendChild( target );
			parentWithOverflow.appendChild( limiter );
			parentWithOverflow.appendChild( element );
			document.body.appendChild( parentWithOverflow );

			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true,
				viewportOffsetConfig: {
					top: 100,
					left: 0,
					right: 0,
					bottom: 0
				}
			}, 'right-bottom' );

			parentWithOverflow.remove();
		} );

		it( 'should return proper calculated position when first ancestor\'s Rect has undefined values', () => {
			limiter.appendChild( target );
			parentWithOverflow.appendChild( limiter );
			parentWithOverflow.appendChild( element );
			document.body.appendChild( parentWithOverflow );

			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'right-bottom' );

			parentWithOverflow.remove();
		} );

		it( 'should return proper calculated position when `target` is a Range', () => {
			const limiter = getElement( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			const target = document.createRange();
			target.selectNode( document.body );

			const element = getElement( {
				top: 0,
				right: 100,
				bottom: 100,
				left: 0,
				width: 100,
				height: 100
			} );

			parentWithOverflow.appendChild( limiter );
			parentWithOverflow.appendChild( element );
			document.body.appendChild( parentWithOverflow );

			assertPositionName( {
				element, target, limiter,
				positions: allPositions,
				fitInViewport: true
			}, 'bottom-right' );

			limiter.remove();
			element.remove();
			parentWithOverflow.remove();
		} );
	} );
} );

function assertPosition( options, expected ) {
	const position = getOptimalPosition( options );
	const { top, left, name } = position;

	expect( { top, left, name } ).to.deep.equal( expected );
}

function assertPositionName( options, expected ) {
	const position = getOptimalPosition( options );

	expect( position.name ).to.equal( expected );
}

function assertNullPosition( options ) {
	const position = getOptimalPosition( options );

	expect( position ).to.be.null;
}

// Returns a synthetic element.
//
// @private
// @param {Object} properties A set of properties for the element.
// @param {Object} styles A set of styles in `window.getComputedStyle()` format.
function getElement( rect = {}, styles = {} ) {
	expect( rect.right - rect.left ).to.equal( rect.width, 'getElement incorrect horizontal values' );
	expect( rect.bottom - rect.top ).to.equal( rect.height, 'getElement incorrect vertical values' );

	const element = document.createElement( 'div' );
	document.body.appendChild( element );

	sinon.stub( element, 'getBoundingClientRect' ).returns( rect );

	if ( !styles.borderLeftWidth ) {
		styles.borderLeftWidth = '0px';
	}

	if ( !styles.borderTopWidth ) {
		styles.borderTopWidth = '0px';
	}

	Object.assign( element.style, styles );

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
