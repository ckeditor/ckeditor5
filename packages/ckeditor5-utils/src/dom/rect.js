/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/rect
 */

import global from './global';
import isRange from './isrange';
import isElement from '../lib/lodash/isElement';
import getBorderWidths from './getborderwidths';

/**
 * A helper class representing a `ClientRect` object, e.g. value returned by
 * the native `object.getBoundingClientRect()` method. Provides a set of methods
 * to manipulate the rect and compare it against other `Rect` instances.
 */
export default class Rect {
	/**
	 * Creates an instance of rect.
	 *
	 *		// Rect of an HTMLElement.
	 *		const rectA = new Rect( document.body );
	 *
	 *		// Rect of a DOM Range.
	 *		const rectB = new Rect( document.getSelection().getRangeAt( 0 ) );
	 *
	 *		// Rect out of an object.
	 *		const rectC = new Rect( { top: 0, right: 10, bottom: 10, left: 0, width: 10, height: 10 } );
	 *
	 *		// Rect out of another Rect instance.
	 *		const rectD = new Rect( rectC );
	 *
	 *		// Rect out of a ClientRect.
	 *		const rectE = new Rect( document.body.getClientRects().item( 0 ) );
	 *
	 * **Note**: By default `Rect` of `HTMLElement` includes its CSS borders and scrollbars (if any).
	 * Use `options.excludeScrollbarsAndBorders` to obtain an "inner rect".
	 *
	 *		// Rect of an HTMLElement, scrollbars excluded.
	 *		const rectF = new Rect( document.body, { excludeScrollbarsAndBorders: true } );
	 *
	 * @param {HTMLElement|Range|ClientRect|module:utils/dom/rect~Rect|Object} source A source object to create the rect.
	 * @param {Boolean} [options.excludeScrollbarsAndBorders] When set `true` the `Rect` will not include
	 * CSS borders and scrollbars. The option is valid for `HTMLElement` passed as a `source` only.
	 */
	constructor( source, options = {} ) {
		/**
		 * The object this rect is for.
		 *
		 * @protected
		 * @readonly
		 * @member {HTMLElement|Range|ClientRect|module:utils/dom/rect~Rect|Object} #_source
		 */
		Object.defineProperty( this, '_source', {
			// If the source is a Rect instance, copy it's #_source.
			value: source._source || source,
			writable: true,
			enumerable: false
		} );

		if ( isElement( source ) ) {
			copyRectProperties( this, source.getBoundingClientRect() );

			if ( options.excludeScrollbarsAndBorders ) {
				this._excludeScrollbarsAndBorders();
			}
		} else if ( isRange( source ) ) {
			copyRectProperties( this, Rect.getDomRangeRects( source )[ 0 ] );
		} else {
			copyRectProperties( this, source );
		}

		/**
		 * The "top" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #top
		 */

		/**
		 * The "right" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #right
		 */

		/**
		 * The "bottom" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #bottom
		 */

		/**
		 * The "left" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #left
		 */

		/**
		 * The "width" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #width
		 */

		/**
		 * The "height" value of the rect.
		 *
		 * @readonly
		 * @member {Number} #height
		 */
	}

	/**
	 * Returns a clone of the rect.
	 *
	 * @returns {module:utils/dom/rect~Rect} A cloned rect.
	 */
	clone() {
		return new Rect( this );
	}

	/**
	 * Moves the rect so that its upper–left corner lands in desired `[ x, y ]` location.
	 *
	 * @param {Number} x Desired horizontal location.
	 * @param {Number} y Desired vertical location.
	 * @returns {module:utils/dom/rect~Rect} A rect which has been moved.
	 */
	moveTo( x, y ) {
		this.top = y;
		this.right = x + this.width;
		this.bottom = y + this.height;
		this.left = x;

		return this;
	}

	/**
	 * Moves the rect in–place by a dedicated offset.
	 *
	 * @param {Number} x A horizontal offset.
	 * @param {Number} y A vertical offset
	 * @returns {module:utils/dom/rect~Rect} A rect which has been moved.
	 */
	moveBy( x, y ) {
		this.top += y;
		this.right += x;
		this.left += x;
		this.bottom += y;

		return this;
	}

	/**
	 * Returns a new rect a a result of intersection with another rect.
	 *
	 * @param {module:utils/dom/rect~Rect} anotherRect
	 * @returns {module:utils/dom/rect~Rect}
	 */
	getIntersection( anotherRect ) {
		const rect = {
			top: Math.max( this.top, anotherRect.top ),
			right: Math.min( this.right, anotherRect.right ),
			bottom: Math.min( this.bottom, anotherRect.bottom ),
			left: Math.max( this.left, anotherRect.left )
		};

		rect.width = rect.right - rect.left;
		rect.height = rect.bottom - rect.top;

		if ( rect.width < 0 || rect.height < 0 ) {
			return null;
		} else {
			return new Rect( rect );
		}
	}

	/**
	 * Returns the area of intersection with another rect.
	 *
	 * @param {module:utils/dom/rect~Rect} anotherRect [description]
	 * @returns {Number} Area of intersection.
	 */
	getIntersectionArea( anotherRect ) {
		const rect = this.getIntersection( anotherRect );

		if ( rect ) {
			return rect.getArea();
		} else {
			return 0;
		}
	}

	/**
	 * Returns the area of the rect.
	 *
	 * @returns {Number}
	 */
	getArea() {
		return this.width * this.height;
	}

	/**
	 * Returns a new rect, a part of the original rect, which is actually visible to the user,
	 * e.g. an original rect cropped by parent element rects which have `overflow` set in CSS
	 * other than `"visible"`.
	 *
	 * If there's no such visible rect, which is when the rect is limited by one or many of
	 * the ancestors, `null` is returned.
	 *
	 * @returns {module:utils/dom/rect~Rect|null} A visible rect instance or `null`, if there's none.
	 */
	getVisible() {
		const source = this._source;
		let visibleRect = this.clone();

		// There's no ancestor to crop <body> with the overflow.
		if ( source != global.document.body ) {
			let parent = source.parentNode || source.commonAncestorContainer;

			// Check the ancestors all the way up to the <body>.
			while ( parent && parent != global.document.body ) {
				const parentRect = new Rect( parent );
				const intersectionRect = visibleRect.getIntersection( parentRect );

				if ( intersectionRect ) {
					if ( intersectionRect.getArea() < visibleRect.getArea() ) {
						// Reduce the visible rect to the intersection.
						visibleRect = intersectionRect;
					}
				} else {
					// There's no intersection, the rect is completely invisible.
					return null;
				}

				parent = parent.parentNode;
			}
		}

		return visibleRect;
	}

	/**
	 * Checks if all properties ({@link #top}, {@link #left}, {@link #right},
	 * {@link #bottom}, {@link #width} and {@link #height}) are the same as in the other `Rect`.
	 *
	 * @param {Rect} rect A `Rect` instance to compare with.
	 * @returns {Boolean} `true` when Rects are equal. `false` otherwise.
	 */
	isEqual( anotherRect ) {
		for ( const prop of rectProperties ) {
			if ( this[ prop ] !== anotherRect[ prop ] ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks whether a `Rect` fully contains another `Rect` instance.
	 *
	 * @param {module:utils/dom/rect~Rect} anotherRect
	 * @returns {Boolean} `true` if contains, `false` otherwise.
	 */
	contains( anotherRect ) {
		const intersectRect = this.getIntersection( anotherRect );

		if ( !intersectRect || !intersectRect.isEqual( anotherRect ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Returns a rect of the web browser viewport.
	 *
	 * @returns {module:utils/dom/rect~Rect} A viewport rect.
	 * @param {Boolean} [options.excludeScrollbars] When set `true` the `Rect` will not include
	 * the scrollbars of the viewport.
	 */
	static getViewportRect( options = {} ) {
		const { innerWidth, innerHeight } = global.window;
		const rect = new Rect( {
			top: 0,
			right: innerWidth,
			bottom: innerHeight,
			left: 0,
			width: innerWidth,
			height: innerHeight
		} );

		rect._source = global.window;

		if ( options.excludeScrollbars ) {
			rect._excludeScrollbarsAndBorders();
		}

		return rect;
	}

	/**
	 * Returns an array of rects of the given native DOM Range.
	 *
	 * @param {Range} range A native DOM range.
	 * @returns {Array.<module:utils/dom/rect~Rect>} DOM Range rects.
	 */
	static getDomRangeRects( range ) {
		const rects = [];
		// Safari does not iterate over ClientRectList using for...of loop.
		const clientRects = Array.from( range.getClientRects() );

		if ( clientRects.length ) {
			for ( const rect of clientRects ) {
				rects.push( new Rect( rect ) );
			}
		}
		// If there's no client rects for the Range, use parent container's bounding rect
		// instead and adjust rect's width to simulate the actual geometry of such range.
		// https://github.com/ckeditor/ckeditor5-utils/issues/153
		else {
			const startContainerRect = new Rect( range.startContainer.getBoundingClientRect() );
			startContainerRect.right = startContainerRect.left;
			startContainerRect.width = 0;

			rects.push( startContainerRect );
		}

		return rects;
	}

	/**
	 * Excludes scrollbars and CSS borders from the `Rect`.
	 *
	 * * Borders are removed when {@link #_source} is `HTMLElement`.
	 * * Scrollbars are excluded from `HTMLElements` and {@link #getViewportRect viewport rects}.
	 *
	 * @private
	 */
	_excludeScrollbarsAndBorders() {
		const source = this._source;
		let scrollBarWidth, scrollBarHeight;

		if ( source === global.window ) {
			scrollBarWidth = global.window.innerWidth - global.document.documentElement.clientWidth;
			scrollBarHeight = global.window.innerHeight - global.document.documentElement.clientHeight;
		} else {
			const borderWidths = getBorderWidths( this._source );

			scrollBarWidth = source.offsetWidth - source.clientWidth;
			scrollBarHeight = source.offsetHeight - source.clientHeight;

			this.moveBy( borderWidths.left, borderWidths.top );
		}

		// Assuming LTR scrollbars. TODO: RTL.
		this.width -= scrollBarWidth;
		this.right -= scrollBarWidth;

		this.height -= scrollBarHeight;
		this.bottom -= scrollBarHeight;
	}
}

const rectProperties = [ 'top', 'right', 'bottom', 'left', 'width', 'height' ];

// Acquires all the rect properties from the passed source.
//
// @private
// @param {module:utils/dom/rect~Rect} rect
// @param {ClientRect|module:utils/dom/rect~Rect|Object} source
function copyRectProperties( rect, source ) {
	for ( const p of rectProperties ) {
		rect[ p ] = source[ p ];
	}
}
