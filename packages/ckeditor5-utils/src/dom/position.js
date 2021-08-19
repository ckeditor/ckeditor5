/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/position
 */

import global from './global';
import Rect from './rect';
import getPositionedAncestor from './getpositionedancestor';
import getBorderWidths from './getborderwidths';
import { isFunction } from 'lodash-es';

// @if CK_DEBUG_POSITION // import { RectDrawer } from '@ckeditor/ckeditor5-minimap/src/utils';

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
 *		const { left, top, name, withArrow } = getOptimalPosition( {
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
 *		console.log( name ); // -> "myNorthEastPosition"
 *
 *		// Using the absolute coordinates which has been found to position the element
 *		// as in the diagram depicting the "myNorthEastPosition" position.
 *		element.style.top = top;
 *		element.style.left = left;
 *
 * @param {module:utils/dom/position~Options} options Positioning options object.
 * @returns {module:utils/dom/position~Position}
 */
export function getOptimalPosition( { element, target, positions, limiter, fitInViewport, viewportOffsetConfig } ) {
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

	const positionedElementAncestor = getPositionedAncestor( element );
	const elementRect = new Rect( element );
	const targetRect = new Rect( target );

	let bestPosition;

	// @if CK_DEBUG_POSITION // RectDrawer.clear();
	// @if CK_DEBUG_POSITION // RectDrawer.draw( targetRect, { outlineWidth: '5px' }, 'Target' );

	const positionOptions = { targetRect, elementRect, positionedElementAncestor };

	// If there are no limits, just grab the very first position and be done with that drama.
	if ( !limiter && !fitInViewport ) {
		bestPosition = new Position( positions[ 0 ], positionOptions );
	} else {
		const limiterRect = limiter && new Rect( limiter ).getVisible();
		const viewportRect = fitInViewport && getConstrainedViewportRect( viewportOffsetConfig );

		// @if CK_DEBUG_POSITION // if ( viewportRect ) {
		// @if CK_DEBUG_POSITION //		RectDrawer.draw( viewportRect, { outlineWidth: '5px' }, 'Viewport' );
		// @if CK_DEBUG_POSITION // }

		// @if CK_DEBUG_POSITION // if ( limiter ) {
		// @if CK_DEBUG_POSITION // 	RectDrawer.draw( limiterRect, { outlineWidth: '5px', outlineColor: 'green' }, 'Visible limiter' );
		// @if CK_DEBUG_POSITION // }

		Object.assign( positionOptions, { limiterRect, viewportRect } );

		// If there's no best position found, i.e. when all intersections have no area because
		// rects have no width or height, then just use the first available position.
		bestPosition = getBestPosition( positions, positionOptions ) || new Position( positions[ 0 ], positionOptions );
	}

	return bestPosition;
}

class Position {
	constructor( positioningFunction, options ) {
		const positioningFunctionOutput = positioningFunction( options.targetRect, options.elementRect, options.viewportRect );

		// Nameless position for a function that didn't participate.
		if ( !positioningFunctionOutput ) {
			return;
		}

		const { left, top, name, withArrow } = positioningFunctionOutput;

		Object.assign( this, { name, withArrow } );

		this._positioningFunctionCorrdinates = { left, top };
		this._options = options;
	}

	get left() {
		return this._absoluteRect.left;
	}

	get top() {
		return this._absoluteRect.top;
	}

	// TODO
	get limiterIntersectionArea() {
		const limiterRect = this._options.limiterRect;

		if ( limiterRect ) {
			const viewportRect = this._options.viewportRect;

			if ( viewportRect ) {
				// Consider only the part of the limiter which is visible in the viewport. So the limiter is getting limited.
				const limiterViewportIntersectRect = limiterRect.getIntersection( viewportRect );

				if ( limiterViewportIntersectRect ) {
					// If the limiter is within the viewport, then check the intersection between that part of the
					// limiter and actual position.
					return limiterViewportIntersectRect.getIntersectionArea( this._rect );
				}
			} else {
				return limiterRect.getIntersectionArea( this._rect );
			}
		}

		return 0;
	}

	// TODO
	get viewportIntersectionArea() {
		const viewportRect = this._options.viewportRect;

		if ( viewportRect ) {
			return viewportRect.getIntersectionArea( this._rect );
		}

		return 0;
	}

	get _rect() {
		if ( this._cachedRect ) {
			return this._cachedRect;
		}

		this._cachedRect = this._options.elementRect.clone().moveTo(
			this._positioningFunctionCorrdinates.left,
			this._positioningFunctionCorrdinates.top
		);

		return this._cachedRect;
	}

	get _absoluteRect() {
		// Speed optimization.
		if ( this._cachedAbsoluteRect ) {
			return this._cachedAbsoluteRect;
		}

		this._cachedAbsoluteRect = getRectForAbsolutePositioning( this._rect );

		if ( this._options.positionedElementAncestor ) {
			shiftRectToCompensatePositionedAncestor( this._cachedAbsoluteRect, this._options.positionedElementAncestor );
		}

		return this._cachedAbsoluteRect;
	}
}

// Returns viewport `Rect` shrinked by viewportOffset config.
//
// @private
// @param {Object} an object containing viewportOffset config.
function getConstrainedViewportRect( viewportOffsetConfig ) {
	viewportOffsetConfig = Object.assign( { top: 0, bottom: 0, left: 0, right: 0 }, viewportOffsetConfig );

	const viewportRect = new Rect( global.window );

	viewportRect.top += viewportOffsetConfig.top;
	viewportRect.height -= viewportOffsetConfig.top;
	viewportRect.bottom -= viewportOffsetConfig.bottom;
	viewportRect.height -= viewportOffsetConfig.bottom;

	return viewportRect;
}

// For a given array of positioning functions, returns such that provides the best
// fit of the `elementRect` into the `limiterRect` and `viewportRect`.
//
// @private
//
// @param {Object} options
// @param {module:utils/dom/position~Options#positions} positions Functions returning {@link module:utils/dom/position~Position}
// to be checked, in the order of preference.
// @param {Object} options
// @param {utils/dom/rect~Rect} options.targetRect A rect of the {@link module:utils/dom/position~Options#target}.
// @param {utils/dom/rect~Rect} options.elementRect A rect of positioned {@link module:utils/dom/position~Options#element}.
// @param {utils/dom/rect~Rect} options.limiterRect A rect of the {@link module:utils/dom/position~Options#limiter}.
// @param {utils/dom/rect~Rect} options.viewportRect A rect of the viewport.
//
// @returns {Array} An array containing the name of the position and it's rect.
function getBestPosition( positions, options ) {
	const { elementRect, viewportRect } = options;

	// This is when element is fully visible.
	const elementRectArea = elementRect.getArea();

	// Let's calculate intersection areas for positions. It will end early if best match is found.
	// const processedPositions = processPositionsToAreas( positions, options );

	const _positions = positions
		.map( positioningFunction => new Position( positioningFunction, options ) )
		// Some positioning functions may return `null` if they don't want to participate.
		.filter( position => !!position.name );

	// First let's check all positions that fully fit in the viewport.
	if ( viewportRect ) {
		const positionsInViewport = _positions.filter( position => {
			return position.viewportIntersectionArea === elementRectArea;
		} );

		// Try to find best position from those which fit completely in viewport.
		const bestPosition = getBestConstrainedPosition( positionsInViewport, elementRectArea );

		if ( bestPosition ) {
			return bestPosition;
		}
	}

	// Either there is no viewportRect or there is no position that fits completely in the viewport.
	return getBestConstrainedPosition( _positions, elementRectArea );
}

// For a given array of processed position data (with calculated Rects for positions and intersection areas)
//
//	* {String} positionName Name of position.
//	* {utils/dom/rect~Rect} positionRect Rect of position.
//	* {Number} limiterIntersectionArea Area of intersection of the position with limiter part that is in the viewport.
//	* {Number} viewportIntersectionArea Area of intersection of the position with viewport.
//
// @param {Number} elementRectArea Area of positioned {@link module:utils/dom/position~Options#element}.
// @returns {Array|null} An array containing the name of the position and it's rect, or null if not found.
function getBestConstrainedPosition( processedPositions, elementRectArea ) {
	let maxFitFactor = 0;
	let bestPosition = null;

	for ( const position of processedPositions ) {
		const { limiterIntersectionArea, viewportIntersectionArea } = position;

		// If a such position is found that element is fully container by the limiter then, obviously,
		// there will be no better one, so finishing.
		if ( limiterIntersectionArea === elementRectArea ) {
			return position;
		}

		// To maximize both viewport and limiter intersection areas we use distance on viewportIntersectionArea
		// and limiterIntersectionArea plane (without sqrt because we are looking for max value).
		const fitFactor = viewportIntersectionArea ** 2 + limiterIntersectionArea ** 2;

		if ( fitFactor > maxFitFactor ) {
			maxFitFactor = fitFactor;
			bestPosition = position;
		}
	}

	return bestPosition;
}

// For a given absolute Rect coordinates object and a positioned element ancestor, it returns an object with
// new Rect coordinates that make up for the position and the scroll of the ancestor.
//
// This is necessary because while Rects (and DOMRects) are relative to the browser's viewport, their coordinates
// are used in real–life to position elements with `position: absolute`, which are scoped by any positioned
// (and scrollable) ancestors.
//
// @private
//
// @param {Object} absoluteRect An object with absolute rect coordinates.
// @param {Object} absoluteRect.top
// @param {Object} absoluteRect.left
// @param {HTMLElement} positionedElementAncestor An ancestor element that should be considered.
//
// @returns {Object} An object corresponding to `absoluteRect` input but with values shifted
// to make up for the positioned element ancestor.
function shiftRectToCompensatePositionedAncestor( rect, positionedElementAncestor ) {
	const ancestorPosition = getRectForAbsolutePositioning( new Rect( positionedElementAncestor ) );
	const ancestorBorderWidths = getBorderWidths( positionedElementAncestor );

	let moveX = 0;
	let moveY = 0;

	// (https://github.com/ckeditor/ckeditor5-ui-default/issues/126)
	// If there's some positioned ancestor of the panel, then its `Rect` must be taken into
	// consideration. `Rect` is always relative to the viewport while `position: absolute` works
	// with respect to that positioned ancestor.
	moveX -= ancestorPosition.left;
	moveY -= ancestorPosition.top;

	// (https://github.com/ckeditor/ckeditor5-utils/issues/139)
	// If there's some positioned ancestor of the panel, not only its position must be taken into
	// consideration (see above) but also its internal scrolls. Scroll have an impact here because `Rect`
	// is relative to the viewport (it doesn't care about scrolling), while `position: absolute`
	// must compensate that scrolling.
	moveX += positionedElementAncestor.scrollLeft;
	moveY += positionedElementAncestor.scrollTop;

	// (https://github.com/ckeditor/ckeditor5-utils/issues/139)
	// If there's some positioned ancestor of the panel, then its `Rect` includes its CSS `borderWidth`
	// while `position: absolute` positioning does not consider it.
	// E.g. `{ position: absolute, top: 0, left: 0 }` means upper left corner of the element,
	// not upper-left corner of its border.
	moveX -= ancestorBorderWidths.left;
	moveY -= ancestorBorderWidths.top;

	rect.moveBy( moveX, moveY );
}

// DOMRect (also Rect) works in a scroll–independent geometry but `position: absolute` doesn't.
// This function converts Rect to `position: absolute` coordinates.
//
// @private
// @param {utils/dom/rect~Rect} rect A rect to be converted.
// @returns {Object} Object containing `left` and `top` properties, in absolute coordinates.
function getRectForAbsolutePositioning( rect ) {
	const { scrollX, scrollY } = global.window;

	return rect.clone().moveBy( scrollX, scrollY );
}

/**
 * The `getOptimalPosition()` helper options.
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
 * @member {HTMLElement|Range|Window|ClientRect|DOMRect|module:utils/dom/rect~Rect|Object|Function} #target
 */

/**
 * An array of functions which return {@link module:utils/dom/position~Position} relative
 * to the `target`, in the order of preference.
 *
 * **Note**: If a function returns `null`, it is ignored by the `getOptimalPosition()`.
 *
 * @member {Array.<Function>} #positions
 */

/**
 * When set, the algorithm will chose position which fits the most in the
 * limiter's bounding rect.
 *
 * @member {HTMLElement|Range|Window|ClientRect|DOMRect|module:utils/dom/rect~Rect|Object|Function} #limiter
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
