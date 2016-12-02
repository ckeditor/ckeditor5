/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

/**
 * @module utils/dom/position
 */

import Rect from './rect.js';
import getPositionedAncestor from './getpositionedancestor.js';

/**
 * Calculates the `position: absolute` coordinates of a given element so it can be positioned with respect to the
 * target in the visually most efficient way, taking various restrictions like viewport or limiter geometry
 * into consideration.
 *
 * TODO: more docs and example.
 *
 * @param {module:utils/dom/position~Options} options Positioning options object.
 * @returns {Object} An object containing CSS `top`, `left` coordinates ready to use with `position: absolute` and the `name`
 * of the position.
 */
export function getOptimalPosition( { element, target, positions, limiter, fitInViewport } ) {
	const elementRect = new Rect( element );
	const targetRect = new Rect( target );
	const positionedElementAncestor = getPositionedAncestor( element.parentElement );

	let bestPositionName;
	let left;
	let top;

	// If there are no limits, just grab the very first position and be done with that drama.
	if ( !limiter && !fitInViewport ) {
		[ bestPositionName, { left, top } ] = getPositionRect( positions[ 0 ], targetRect, elementRect );
	} else {
		const limiterRect = limiter && new Rect( limiter );
		const viewportRect = fitInViewport && Rect.getViewportRect();

		[ bestPositionName, { left, top } ] = getBestPositionRect( positions, targetRect, elementRect, limiterRect, viewportRect );
	}

	// (#126) If there's some positioned ancestor of the panel, then its rect must be taken into
	// consideration. `Rect` is always relative to the viewport while `position: absolute` works
	// with respect to that positioned ancestor.
	if ( positionedElementAncestor ) {
		const { top: ancestorTop, left: ancestorLeft } = new Rect( positionedElementAncestor );

		top -= ancestorTop;
		left -= ancestorLeft;
	}

	// DOMRect works in a scroll–independent geometry but `position: absolute` doesn't.
	// Let's fix it at this stage.
	top += window.scrollY;
	left += window.scrollX;

	return {
		top, left,
		name: bestPositionName
	};
}

// For given position function, returns a corresponding `Rect` instance.
//
// @private
// @param {Function} position A function returning {@link module:utils/dom/position~Position}.
// @param {Rect} targetRect A rect of the target.
// @param {Rect} elementRect A rect of positioned element.
// @returns {Array} An array containing position name and its Rect.
function getPositionRect( position, targetRect, elementRect ) {
	const { left, top, name } = position( targetRect, elementRect );

	return [ name, elementRect.clone().moveTo( left, top ) ];
}

// For a given array of positioning functions, returns such that provides the best
// fit of the `elementRect` into the `limiterRect` and `viewportRect`.
//
// @private
// @param {module:utils/dom/position~Options#positions} positions Functions returning
// {@link module:utils/dom/position~Position} to be checked, in the order of preference.
// @param {Rect} targetRect A rect of the {@link module:utils/dom/position~Options#target}.
// @param {Rect} elementRect A rect of positioned {@link module:utils/dom/position~Options#element}.
// @param {Rect} limiterRect A rect of the {@link module:utils/dom/position~Options#limiter}.
// @param {Rect} viewportRect A rect of the viewport.
// @returns {Array} An array containing the name of the position and it's rect.
function getBestPositionRect( positions, targetRect, elementRect, limiterRect, viewportRect ) {
	let maxLimiterIntersectArea = -1;
	let maxViewportIntersectArea = -1;
	let bestPositionRect;
	let bestPositionName;

	// This is when element is fully visible.
	const elementRectArea = elementRect.getArea();

	positions.some( position => {
		const [ positionName, positionRect ] = getPositionRect( position, targetRect, elementRect );
		let limiterIntersectArea;
		let viewportIntersectArea;

		if ( limiterRect ) {
			if ( viewportRect ) {
				limiterIntersectArea = limiterRect.getIntersection( viewportRect ).getIntersectionArea( positionRect );
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

	return [ bestPositionName, bestPositionRect ];
}

/**
 * The `getOptimalPosition` helper options.
 *
 * @interface module:utils/dom/position~Options
 */

/**
 * Element that is to be positioned.
 *
 * @member {HTMLElement} module:utils/dom/position~Options#element
 */

/**
 * Target with respect to which the `element` is to be positioned.
 *
 * @member {HTMLElement|Range} module:utils/dom/position~Options#target
 */

/**
 * An array of functions which return {@link module:utils/dom/position~Position} relative
 * to the `target`, in the order of preference.
 *
 * @member {Array.<Function>} module:utils/dom/position~Options#positions
 */

/**
 * When set, the algorithm will chose position which fits the most in the
 * limiter's bounding rect.
 *
 * @member {HTMLElement|Range} module:utils/dom/position~Options#limiter
 */

/**
 * When set, the algorithm will chose such a position which fits `element`
 * the most inside visible viewport.
 *
 * @member {Boolean} module:utils/dom/position~Options#fitInViewport
 */

/**
 * An object describing the position in `position: absolute` coordinate
 * system.
 *
 * @typedef {Object} module:utils/dom/position~Position
 *
 * @property {Number} top Top position offset.
 * @property {Number} left Left position offset.
 * @property {String} name Name of the position.
 */
