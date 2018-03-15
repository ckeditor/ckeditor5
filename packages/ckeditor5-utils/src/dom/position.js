/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/position
 */

import global from './global';
import Rect from './rect';
import getPositionedAncestor from './getpositionedancestor';
import getBorderWidths from './getborderwidths';
import isFunction from '../lib/lodash/isFunction';

/**
 * Calculates the `position: absolute` coordinates of a given element so it can be positioned with respect to the
 * target in the visually most efficient way, taking various restrictions like viewport or limiter geometry
 * into consideration.
 *
 *		// The element which is to be positioned.
 *		const element = document.body.querySelector( '#toolbar' );
 *
 *		// A target to which the element is positioned relatively.
 *		const target = document.body.querySelector( '#container' );
 *
 *		// Finding the optimal coordinates for the positioning.
 *		const { left, top, name } = getOptimalPosition( {
 *			element: element,
 *			target: target,
 *
 * 			// The algorithm will chose among these positions to meet the requirements such
 * 			// as "limiter" element or "fitInViewport", set below. The positions are considered
 * 			// in the order of the array.
 *			positions: [
 *				//
 *			 	//	[ Target ]
 *				//	+-----------------+
 *				//	|     Element     |
 *				//	+-----------------+
 *				//
 *				targetRect => ( {
 *					top: targetRect.bottom,
 *					left: targetRect.left,
 *					name: 'mySouthEastPosition'
 *				} ),
 *
 *				//
 *				//	+-----------------+
 *				//	|     Element     |
 *				//	+-----------------+
 *				//	[ Target ]
 *				//
 *				( targetRect, elementRect ) => ( {
 *					top: targetRect.top - elementRect.height,
 *					left: targetRect.left,
 *					name: 'myNorthEastPosition'
 *				} )
 *			],
 *
 *			// Find a position such guarantees the element remains within visible boundaries of <body>.
 *			limiter: document.body,
 *
 *			// Find a position such guarantees the element remains within visible boundaries of the browser viewport.
 *			fitInViewport: true
 *		} );
 *
 *		// The best position which fits into document.body and the viewport. May be useful
 *		// to set proper class on the `element`.
 *		console.log( name ); -> "myNorthEastPosition"
 *
 *		// Using the absolute coordinates which has been found to position the element
 *		// as in the diagram depicting the "myNorthEastPosition" position.
 *		element.style.top = top;
 *		element.style.left = left;
 *
 * @param {module:utils/dom/position~Options} options Positioning options object.
 * @returns {module:utils/dom/position~Position}
 */
export function getOptimalPosition( { element, target, positions, limiter, fitInViewport } ) {
	// If the {@link module:utils/dom/position~Options#target} is a function, use what it returns.
	// https://github.com/ckeditor/ckeditor5-utils/issues/157
	if ( isFunction( target ) ) {
		target = target();
	}

	// If the {@link module:utils/dom/position~Options#limiter} is a function, use what it returns.
	// https://github.com/ckeditor/ckeditor5-ui/issues/260
	if ( isFunction( limiter ) ) {
		limiter = limiter();
	}

	const positionedElementAncestor = getPositionedAncestor( element.parentElement );
	const elementRect = new Rect( element );
	const targetRect = new Rect( target );

	let bestPosition;
	let name;

	// If there are no limits, just grab the very first position and be done with that drama.
	if ( !limiter && !fitInViewport ) {
		[ name, bestPosition ] = getPosition( positions[ 0 ], targetRect, elementRect );
	} else {
		const limiterRect = limiter && new Rect( limiter ).getVisible();
		const viewportRect = fitInViewport && new Rect( global.window );

		[ name, bestPosition ] =
			getBestPosition( positions, targetRect, elementRect, limiterRect, viewportRect ) ||
			// If there's no best position found, i.e. when all intersections have no area because
			// rects have no width or height, then just use the first available position.
			getPosition( positions[ 0 ], targetRect, elementRect );
	}

	let { left, top } = getAbsoluteRectCoordinates( bestPosition );

	if ( positionedElementAncestor ) {
		const ancestorPosition = getAbsoluteRectCoordinates( new Rect( positionedElementAncestor ) );
		const ancestorBorderWidths = getBorderWidths( positionedElementAncestor );

		// (https://github.com/ckeditor/ckeditor5-ui-default/issues/126)
		// If there's some positioned ancestor of the panel, then its `Rect` must be taken into
		// consideration. `Rect` is always relative to the viewport while `position: absolute` works
		// with respect to that positioned ancestor.
		left -= ancestorPosition.left;
		top -= ancestorPosition.top;

		// (https://github.com/ckeditor/ckeditor5-utils/issues/139)
		// If there's some positioned ancestor of the panel, not only its position must be taken into
		// consideration (see above) but also its internal scrolls. Scroll have an impact here because `Rect`
		// is relative to the viewport (it doesn't care about scrolling), while `position: absolute`
		// must compensate that scrolling.
		left += positionedElementAncestor.scrollLeft;
		top += positionedElementAncestor.scrollTop;

		// (https://github.com/ckeditor/ckeditor5-utils/issues/139)
		// If there's some positioned ancestor of the panel, then its `Rect` includes its CSS `borderWidth`
		// while `position: absolute` positioning does not consider it.
		// E.g. `{ position: absolute, top: 0, left: 0 }` means upper left corner of the element,
		// not upper-left corner of its border.
		left -= ancestorBorderWidths.left;
		top -= ancestorBorderWidths.top;
	}

	return { left, top, name };
}

// For given position function, returns a corresponding `Rect` instance.
//
// @private
// @param {Function} position A function returning {@link module:utils/dom/position~Position}.
// @param {utils/dom/rect~Rect} targetRect A rect of the target.
// @param {utils/dom/rect~Rect} elementRect A rect of positioned element.
// @returns {Array} An array containing position name and its Rect.
function getPosition( position, targetRect, elementRect ) {
	const { left, top, name } = position( targetRect, elementRect );

	return [ name, elementRect.clone().moveTo( left, top ) ];
}

// For a given array of positioning functions, returns such that provides the best
// fit of the `elementRect` into the `limiterRect` and `viewportRect`.
//
// @private
// @param {module:utils/dom/position~Options#positions} positions Functions returning
// {@link module:utils/dom/position~Position} to be checked, in the order of preference.
// @param {utils/dom/rect~Rect} targetRect A rect of the {@link module:utils/dom/position~Options#target}.
// @param {utils/dom/rect~Rect} elementRect A rect of positioned {@link module:utils/dom/position~Options#element}.
// @param {utils/dom/rect~Rect} limiterRect A rect of the {@link module:utils/dom/position~Options#limiter}.
// @param {utils/dom/rect~Rect} viewportRect A rect of the viewport.
// @returns {Array} An array containing the name of the position and it's rect.
function getBestPosition( positions, targetRect, elementRect, limiterRect, viewportRect ) {
	let maxLimiterIntersectArea = 0;
	let maxViewportIntersectArea = 0;
	let bestPositionRect;
	let bestPositionName;

	// This is when element is fully visible.
	const elementRectArea = elementRect.getArea();

	positions.some( position => {
		const [ positionName, positionRect ] = getPosition( position, targetRect, elementRect );
		let limiterIntersectArea;
		let viewportIntersectArea;

		if ( limiterRect ) {
			if ( viewportRect ) {
				// Consider only the part of the limiter which is visible in the viewport. So the limiter is getting limited.
				const limiterViewportIntersectRect = limiterRect.getIntersection( viewportRect );

				if ( limiterViewportIntersectRect ) {
					// If the limiter is within the viewport, then check the intersection between that part of the
					// limiter and actual position.
					limiterIntersectArea = limiterViewportIntersectRect.getIntersectionArea( positionRect );
				} else {
					limiterIntersectArea = 0;
				}
			} else {
				limiterIntersectArea = limiterRect.getIntersectionArea( positionRect );
			}
		}

		if ( viewportRect ) {
			viewportIntersectArea = viewportRect.getIntersectionArea( positionRect );
		}

		// The only criterion: intersection with the viewport.
		if ( viewportRect && !limiterRect ) {
			if ( viewportIntersectArea > maxViewportIntersectArea ) {
				setBestPosition();
			}
		}
		// The only criterion: intersection with the limiter.
		else if ( !viewportRect && limiterRect ) {
			if ( limiterIntersectArea > maxLimiterIntersectArea ) {
				setBestPosition();
			}
		}
		// Two criteria: intersection with the viewport and the limiter visible in the viewport.
		else {
			if ( viewportIntersectArea > maxViewportIntersectArea && limiterIntersectArea >= maxLimiterIntersectArea ) {
				setBestPosition();
			} else if ( viewportIntersectArea >= maxViewportIntersectArea && limiterIntersectArea > maxLimiterIntersectArea ) {
				setBestPosition();
			}
		}

		function setBestPosition() {
			maxViewportIntersectArea = viewportIntersectArea;
			maxLimiterIntersectArea = limiterIntersectArea;
			bestPositionRect = positionRect;
			bestPositionName = positionName;
		}

		// If a such position is found that element is fully container by the limiter then, obviously,
		// there will be no better one, so finishing.
		return limiterIntersectArea === elementRectArea;
	} );

	return bestPositionRect ? [ bestPositionName, bestPositionRect ] : null;
}

// DOMRect (also Rect) works in a scroll–independent geometry but `position: absolute` doesn't.
// This function converts Rect to `position: absolute` coordinates.
//
// @private
// @param {utils/dom/rect~Rect} rect A rect to be converted.
// @returns {Object} Object containing `left` and `top` properties, in absolute coordinates.
function getAbsoluteRectCoordinates( { left, top } ) {
	const { scrollX, scrollY } = global.window;

	return {
		left: left + scrollX,
		top: top + scrollY,
	};
}

/**
 * The `getOptimalPosition` helper options.
 *
 * @interface module:utils/dom/position~Options
 */

/**
 * Element that is to be positioned.
 *
 * @member {HTMLElement} #element
 */

/**
 * Target with respect to which the `element` is to be positioned.
 *
 * @member {HTMLElement|Range|ClientRect|Rect|Function} #target
 */

/**
 * An array of functions which return {@link module:utils/dom/position~Position} relative
 * to the `target`, in the order of preference.
 *
 * @member {Array.<Function>} #positions
 */

/**
 * When set, the algorithm will chose position which fits the most in the
 * limiter's bounding rect.
 *
 * @member {HTMLElement|Range|ClientRect|Rect|Function} #limiter
 */

/**
 * When set, the algorithm will chose such a position which fits `element`
 * the most inside visible viewport.
 *
 * @member {Boolean} #fitInViewport
 */

/**
 * An object describing a position in `position: absolute` coordinate
 * system, along with position name.
 *
 * @typedef {Object} module:utils/dom/position~Position
 *
 * @property {Number} top Top position offset.
 * @property {Number} left Left position offset.
 * @property {String} name Name of the position.
 */
