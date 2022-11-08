/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/position
 */

import global from './global';
import Rect, { type RectSource } from './rect';
import getPositionedAncestor from './getpositionedancestor';
import getBorderWidths from './getborderwidths';
import { isFunction } from 'lodash-es';

// @if CK_DEBUG_POSITION // const { RectDrawer } = require( '@ckeditor/ckeditor5-minimap/src/utils' );

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
 *		console.log( name ); // -> "myNorthEastPosition"
 *
 *		// Using the absolute coordinates which has been found to position the element
 *		// as in the diagram depicting the "myNorthEastPosition" position.
 *		element.style.top = top;
 *		element.style.left = left;
 *
 * @param {module:utils/dom/position~Options} options The input data and configuration of the helper.
 * @returns {module:utils/dom/position~Position}
 */
export function getOptimalPosition( { element, target, positions, limiter, fitInViewport, viewportOffsetConfig }: Options ): Position {
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

	let bestPosition: Position;

	// @if CK_DEBUG_POSITION // RectDrawer.clear();
	// @if CK_DEBUG_POSITION // RectDrawer.draw( targetRect, { outlineWidth: '5px' }, 'Target' );

	const viewportRect = fitInViewport && getConstrainedViewportRect( viewportOffsetConfig ) || null;
	const positionOptions = { targetRect, elementRect, positionedElementAncestor, viewportRect };

	// If there are no limits, just grab the very first position and be done with that drama.
	if ( !limiter && !fitInViewport ) {
		bestPosition = new PositionObject( positions[ 0 ], positionOptions );
	} else {
		const limiterRect = limiter && new Rect( limiter ).getVisible();

		// @if CK_DEBUG_POSITION // if ( viewportRect ) {
		// @if CK_DEBUG_POSITION //		RectDrawer.draw( viewportRect, { outlineWidth: '5px' }, 'Viewport' );
		// @if CK_DEBUG_POSITION // }

		// @if CK_DEBUG_POSITION // if ( limiter ) {
		// @if CK_DEBUG_POSITION // 	RectDrawer.draw( limiterRect, { outlineWidth: '5px', outlineColor: 'green' }, 'Visible limiter' );
		// @if CK_DEBUG_POSITION // }

		Object.assign( positionOptions, { limiterRect, viewportRect } );

		// If there's no best position found, i.e. when all intersections have no area because
		// rects have no width or height, then just use the first available position.
		bestPosition = getBestPosition( positions, positionOptions ) || new PositionObject( positions[ 0 ], positionOptions );
	}

	return bestPosition;
}

// Returns a viewport `Rect` shrunk by the viewport offset config from all sides.
//
// @private
// @param {Object} An object containing viewportOffset config.
// @returns {module:utils/dom/rect~Rect} A shrunken rect of the viewport.
function getConstrainedViewportRect( viewportOffsetConfig: Options[ 'viewportOffsetConfig' ] ): Rect {
	viewportOffsetConfig = Object.assign( { top: 0, bottom: 0, left: 0, right: 0 }, viewportOffsetConfig );

	const viewportRect = new Rect( global.window );

	viewportRect.top += viewportOffsetConfig.top!;
	viewportRect.height -= viewportOffsetConfig.top!;
	viewportRect.bottom -= viewportOffsetConfig.bottom!;
	viewportRect.height -= viewportOffsetConfig.bottom!;

	return viewportRect;
}

// For a given array of positioning functions, returns such that provides the best
// fit of the `elementRect` into the `limiterRect` and `viewportRect`.
//
// @private
//
// @param {module:utils/dom/position~Options#positions} positions Functions returning
// {@link module:utils/dom/position~Position}to be checked, in the order of preference.
// @param {Object} options
// @param {module:utils/dom/rect~Rect} options.elementRect The positioned element rect.
// @param {module:utils/dom/rect~Rect} options.targetRect The target element rect.
// @param {module:utils/dom/rect~Rect} options.viewportRect The viewport rect.
// @param {module:utils/dom/rect~Rect} [options.limiterRect] The limiter rect.
// @param {HTMLElement|null} [options.positionedElementAncestor] Nearest element ancestor element which CSS position is not "static".
//
// @returns {module:utils/dom/position~Position|null} An array containing the name of the position and it's rect.
function getBestPosition(
	positions: ReadonlyArray<PositioningFunction>,
	options: ConstructorParameters<typeof PositionObject>[ 1 ]
): Position | null {
	const { elementRect } = options;

	// This is when element is fully visible.
	const elementRectArea = elementRect.getArea();

	const positionInstances = positions
		.map( positioningFunction => new PositionObject( positioningFunction, options ) )
		// Some positioning functions may return `null` if they don't want to participate.
		.filter( position => !!position.name );

	let maxFitFactor = 0;
	let bestPosition = null;

	for ( const position of positionInstances ) {
		const { limiterIntersectionArea, viewportIntersectionArea } = position;

		// If a such position is found that element is fully contained by the limiter then, obviously,
		// there will be no better one, so finishing.
		if ( limiterIntersectionArea === elementRectArea ) {
			return position;
		}

		// To maximize both viewport and limiter intersection areas we use distance on _viewportIntersectionArea
		// and _limiterIntersectionArea plane (without sqrt because we are looking for max value).
		const fitFactor = viewportIntersectionArea ** 2 + limiterIntersectionArea ** 2;

		if ( fitFactor > maxFitFactor ) {
			maxFitFactor = fitFactor;
			bestPosition = position;
		}
	}

	return bestPosition;
}

// For a given absolute Rect coordinates object and a positioned element ancestor, it updates its
// coordinates that make up for the position and the scroll of the ancestor.
//
// This is necessary because while Rects (and DOMRects) are relative to the browser's viewport, their coordinates
// are used in real–life to position elements with `position: absolute`, which are scoped by any positioned
// (and scrollable) ancestors.
//
// @private
//
// @param {module:utils/dom/rect~Rect} rect A rect with absolute rect coordinates.
// @param {HTMLElement} positionedElementAncestor An ancestor element that should be considered.
function shiftRectToCompensatePositionedAncestor( rect: Rect, positionedElementAncestor: HTMLElement ): void {
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
// @param {module:utils/dom/rect~Rect} rect A rect to be converted.
// @returns {module:utils/dom/rect~Rect} Object containing `left` and `top` properties, in absolute coordinates.
function getRectForAbsolutePositioning( rect: Rect ): Rect {
	const { scrollX, scrollY } = global.window;

	return rect.clone().moveBy( scrollX, scrollY );
}

/**
 * A position object which instances are created and used by the {@link module:utils/dom/position~getOptimalPosition} helper.
 *
 * {@link module:utils/dom/position~Position#top} and {@link module:utils/dom/position~Position#left} properties of the position instance
 * translate directly to the `top` and `left` properties in CSS "`position: absolute` coordinate system". If set on the positioned element
 * in DOM, they will make it display it in the right place in the viewport.
 * @interface
 */
export interface Position {

	/**
	 * Position name.
	 *
	 * @readonly
	 * @member {String}
	 */
	readonly name?: string;

	/**
	 * Additional position configuration, as passed from the {@link module:utils/dom/position~PositioningFunction positioning function}.
	 *
	 * This object can be use, for instance, to pass through presentation options used by the consumer of the
	 * {@link module:utils/dom/position~getOptimalPosition} helper.
	 *
	 * @readonly
	 * @member {Object|undefined}
	 */
	readonly config?: object;

	/**
	 * The left value in pixels in the CSS `position: absolute` coordinate system.
	 * Set it on the positioned element in DOM to move it to the position.
	 *
	 * @readonly
	 * @member {Number}
	 */
	readonly left: number;

	/**
	 * The top value in pixels in the CSS `position: absolute` coordinate system.
	 * Set it on the positioned element in DOM to move it to the position.
	 *
	 * @readonly
	 * @member {Number}
	 */
	readonly top: number;
}

// A position class which instances are created and used by the {@link module:utils/dom/position~getOptimalPosition} helper.
//
// {@link module:utils/dom/position~Position#top} and {@link module:utils/dom/position~Position#left} properties of the position instance
// translate directly to the `top` and `left` properties in CSS "`position: absolute` coordinate system". If set on the positioned element
// in DOM, they will make it display it in the right place in the viewport.
// @private
// @implements {Position}
class PositionObject implements Position {
	public name?: string;
	public config?: object;

	private _positioningFunctionCorrdinates!: { left: number; top: number };
	private _options!: ConstructorParameters<typeof PositionObject>[ 1 ];
	private _cachedRect?: Rect;
	private _cachedAbsoluteRect?: Rect;

	// Creates an instance of the {@link module:utils/dom/position~PositionObject} class.
	//
	// @param {module:utils/dom/position~PositioningFunction} positioningFunction function The function that defines the expected
	// coordinates the positioned element should move to.
	// @param {Object} [options] options object.
	// @param {module:utils/dom/rect~Rect} options.elementRect The positioned element rect.
	// @param {module:utils/dom/rect~Rect} options.targetRect The target element rect.
	// @param {module:utils/dom/rect~Rect|null} options.viewportRect The viewport rect.
	// @param {module:utils/dom/rect~Rect} [options.limiterRect] The limiter rect.
	// @param {HTMLElement|null} [options.positionedElementAncestor] Nearest element ancestor element which CSS position is not "static".
	constructor(
		positioningFunction: PositioningFunction,
		options: {
			readonly elementRect: Rect;
			readonly targetRect: Rect;
			readonly viewportRect: Rect | null;
			readonly positionedElementAncestor?: HTMLElement | null;
			readonly limiterRect?: Rect;
		}
	) {
		const positioningFunctionOutput = positioningFunction( options.targetRect, options.elementRect, options.viewportRect );

		// Nameless position for a function that didn't participate.
		if ( !positioningFunctionOutput ) {
			return;
		}

		const { left, top, name, config } = positioningFunctionOutput;

		this.name = name;
		this.config = config;

		this._positioningFunctionCorrdinates = { left, top };
		this._options = options;
	}

	// The left value in pixels in the CSS `position: absolute` coordinate system.
	// Set it on the positioned element in DOM to move it to the position.
	//
	// @readonly
	// @type {Number}
	public get left(): number {
		return this._absoluteRect.left;
	}

	// The top value in pixels in the CSS `position: absolute` coordinate system.
	// Set it on the positioned element in DOM to move it to the position.
	//
	// @readonly
	// @type {Number}
	public get top(): number {
		return this._absoluteRect.top;
	}

	// An intersection area between positioned element and limiter within viewport constraints.
	//
	// @readonly
	// @type {Number}
	public get limiterIntersectionArea(): number {
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

	// An intersection area between positioned element and viewport.
	//
	// @readonly
	// @type {Number}
	public get viewportIntersectionArea(): number {
		const viewportRect = this._options.viewportRect;

		if ( viewportRect ) {
			return viewportRect.getIntersectionArea( this._rect );
		}

		return 0;
	}

	// An already positioned element rect. A clone of the element rect passed to the constructor
	// but placed in the viewport according to the positioning function.
	//
	// @private
	// @readonly
	// @type {module:utils/dom/rect~Rect}
	private get _rect(): Rect {
		if ( this._cachedRect ) {
			return this._cachedRect;
		}

		this._cachedRect = this._options.elementRect.clone().moveTo(
			this._positioningFunctionCorrdinates.left,
			this._positioningFunctionCorrdinates.top
		);

		return this._cachedRect;
	}

	// An already absolutely positioned element rect. See ({@link #_rect}).
	//
	// @private
	// @readonly
	// @type {module:utils/dom/rect~Rect}
	private get _absoluteRect(): Rect {
		if ( this._cachedAbsoluteRect ) {
			return this._cachedAbsoluteRect;
		}

		this._cachedAbsoluteRect = getRectForAbsolutePositioning( this._rect );

		if ( this._options.positionedElementAncestor ) {
			shiftRectToCompensatePositionedAncestor( this._cachedAbsoluteRect, this._options.positionedElementAncestor );
		}

		return this._cachedAbsoluteRect!;
	}
}

/**
 * The `getOptimalPosition()` helper options.
 *
 * @interface
 */
export interface Options {

	/**
	 * Element that is to be positioned.
	 *
	 * @member {HTMLElement}
	 */
	readonly element: HTMLElement;

	/**
	 * Target with respect to which the `element` is to be positioned.
	 *
	 * @member {module:utils/dom/rect~RectSource|Function}
	 */
	readonly target: RectSource | ( () => RectSource );

	/**
	 * An array of positioning functions.
	 *
	 * **Note**: Positioning functions are processed in the order of preference. The first function that works
	 * in the current environment (e.g. offers the complete fit in the viewport geometry) will be picked by
	 * `getOptimalPosition()`.
	 *
	 * **Note**: Any positioning function returning `null` is ignored.
	 *
	 * @member {Array.<module:utils/dom/position~PositioningFunction>}
	 */
	readonly positions: ReadonlyArray<PositioningFunction>;

	/**
	 * When set, the algorithm will chose position which fits the most in the
	 * limiter's bounding rect.
	 *
	 * @member {module:utils/dom/rect~RectSource|Function}
	 */
	readonly limiter?: RectSource | ( () => ( RectSource | null ) ) | null;

	/**
	 * When set, the algorithm will chose such a position which fits `element`
	 * the most inside visible viewport.
	 *
	 * @member {Boolean}
	 */
	readonly fitInViewport?: boolean;

	/**
	 * Viewport offset config object. It restricts the visible viewport available to the `getOptimalPosition()` from each side.
	 *
	 *		{
	 *			top: 50,
	 *			right: 50,
	 *			bottom: 50,
	 *			left: 50
	 *		}
	 *
	 * @member {Object}
	 */
	readonly viewportOffsetConfig?: {
		readonly top?: number;
		readonly right?: number;
		readonly bottom?: number;
		readonly left?: number;
	};
}

/**
 * A positioning function which, based on positioned element and target {@link module:utils/dom/rect~Rect Rects}, returns rect coordinates
 * representing the geometrical relation between them. Used by the {@link module:utils/dom/position~getOptimalPosition} helper.
 *
 *		// This simple position will place the element directly under the target, in the middle:
 *		//
 *		//	    [ Target ]
 *		//	+-----------------+
 *		//	|     Element     |
 *		//	+-----------------+
 *		//
 *		const position = ( targetRect, elementRect, [ viewportRect ] ) => ( {
 *			top: targetRect.bottom,
 *			left: targetRect.left + targetRect.width / 2 - elementRect.width / 2,
 *			name: 'bottomMiddle',
 *
 *			// Note: The config is optional.
 *			config: {
 *				zIndex: '999'
 *			}
 *		} );
 *
 * @callback module:utils/dom/position~PositioningFunction
 * @param {module:utils/dom/rect~Rect} elementRect The rect of the element to be positioned.
 * @param {module:utils/dom/rect~Rect} targetRect The rect of the target the element (its rect) is relatively positioned to.
 * @param {module:utils/dom/rect~Rect|null} viewportRect The rect of the visual browser viewport.
 * @returns {Object|null} return When the function returns `null`, it will not be considered by
 * {@link module:utils/dom/position~getOptimalPosition}.
 * @returns {Number} return.top The `top` value of the element rect that would represent the position.
 * @returns {Number} return.left The `left` value of the element rect that would represent the position.
 * @returns {String} return.name The name of the position. It helps the user of the {@link module:utils/dom/position~getOptimalPosition}
 * helper to recognize different positioning function results. It will pass through to the {@link module:utils/dom/position~Position}
 * returned by the helper.
 * @returns {Object} [return.config] An optional configuration that will pass-through the
 * {@link module:utils/dom/position~getOptimalPosition} helper to the {@link module:utils/dom/position~Position} returned by this helper.
 * This configuration may, for instance, let the user of {@link module:utils/dom/position~getOptimalPosition} know that this particular
 * position comes with a certain presentation.
 */
export type PositioningFunction = ( elementRect: Rect, targetRect: Rect, viewportRect: Rect | null ) => ( {
	top: number;
	left: number;
	name?: string;
	config?: object;
} | null );
