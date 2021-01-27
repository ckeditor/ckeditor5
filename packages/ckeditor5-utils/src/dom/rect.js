/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/rect
 */

import isRange from './isrange';
import isWindow from './iswindow';
import getBorderWidths from './getborderwidths';
import isText from './istext';
import { isElement } from 'lodash-es';

const rectProperties = [ 'top', 'right', 'bottom', 'left', 'width', 'height' ];

/**
 * A helper class representing a `ClientRect` object, e.g. value returned by
 * the native `object.getBoundingClientRect()` method. Provides a set of methods
 * to manipulate the rect and compare it against other rect instances.
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
	 *		// Rect of a window (web browser viewport).
	 *		const rectC = new Rect( window );
	 *
	 *		// Rect out of an object.
	 *		const rectD = new Rect( { top: 0, right: 10, bottom: 10, left: 0, width: 10, height: 10 } );
	 *
	 *		// Rect out of another Rect instance.
	 *		const rectE = new Rect( rectD );
	 *
	 *		// Rect out of a ClientRect.
	 *		const rectF = new Rect( document.body.getClientRects().item( 0 ) );
	 *
	 * **Note**: By default a rect of an HTML element includes its CSS borders and scrollbars (if any)
	 * ant the rect of a `window` includes scrollbars too. Use {@link #excludeScrollbarsAndBorders}
	 * to get the inner part of the rect.
	 *
	 * @param {HTMLElement|Range|Window|ClientRect|module:utils/dom/rect~Rect|Object} source A source object to create the rect.
	 */
	constructor( source ) {
		const isSourceRange = isRange( source );

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

		if ( isElement( source ) || isSourceRange ) {
			// The `Rect` class depends on `getBoundingClientRect` and `getClientRects` DOM methods. If the source
			// of a rect in an HTML element or a DOM range but it does not belong to any rendered DOM tree, these methods
			// will fail to obtain the geometry and the rect instance makes little sense to the features using it.
			// To get rid of this warning make sure the source passed to the constructor is a descendant of `window.document.body`.
			// @if CK_DEBUG // const sourceNode = isSourceRange ? source.startContainer : source;
			// @if CK_DEBUG // if ( !sourceNode.ownerDocument || !sourceNode.ownerDocument.body.contains( sourceNode ) ) {
			// @if CK_DEBUG // 	console.warn(
			// @if CK_DEBUG // 		'rect-source-not-in-dom: The source of this rect does not belong to any rendered DOM tree.',
			// @if CK_DEBUG // 		{ source } );
			// @if CK_DEBUG // }

			if ( isSourceRange ) {
				const rangeRects = Rect.getDomRangeRects( source );
				copyRectProperties( this, Rect.getBoundingRect( rangeRects ) );
			} else {
				copyRectProperties( this, source.getBoundingClientRect() );
			}
		} else if ( isWindow( source ) ) {
			const { innerWidth, innerHeight } = source;

			copyRectProperties( this, {
				top: 0,
				right: innerWidth,
				bottom: innerHeight,
				left: 0,
				width: innerWidth,
				height: innerHeight
			} );
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
		if ( !isBody( source ) ) {
			let parent = source.parentNode || source.commonAncestorContainer;

			// Check the ancestors all the way up to the <body>.
			while ( parent && !isBody( parent ) ) {
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
	 * Checks if all property values ({@link #top}, {@link #left}, {@link #right},
	 * {@link #bottom}, {@link #width} and {@link #height}) are the equal in both rect
	 * instances.
	 *
	 * @param {module:utils/dom/rect~Rect} rect A rect instance to compare with.
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
	 * Checks whether a rect fully contains another rect instance.
	 *
	 * @param {module:utils/dom/rect~Rect} anotherRect
	 * @returns {Boolean} `true` if contains, `false` otherwise.
	 */
	contains( anotherRect ) {
		const intersectRect = this.getIntersection( anotherRect );

		return !!( intersectRect && intersectRect.isEqual( anotherRect ) );
	}

	/**
	 * Excludes scrollbars and CSS borders from the rect.
	 *
	 * * Borders are removed when {@link #_source} is an HTML element.
	 * * Scrollbars are excluded from HTML elements and the `window`.
	 *
	 * @returns {module:utils/dom/rect~Rect} A rect which has been updated.
	 */
	excludeScrollbarsAndBorders() {
		const source = this._source;
		let scrollBarWidth, scrollBarHeight, direction;

		if ( isWindow( source ) ) {
			scrollBarWidth = source.innerWidth - source.document.documentElement.clientWidth;
			scrollBarHeight = source.innerHeight - source.document.documentElement.clientHeight;
			direction = source.getComputedStyle( source.document.documentElement ).direction;
		} else {
			const borderWidths = getBorderWidths( this._source );

			scrollBarWidth = source.offsetWidth - source.clientWidth - borderWidths.left - borderWidths.right;
			scrollBarHeight = source.offsetHeight - source.clientHeight - borderWidths.top - borderWidths.bottom;
			direction = source.ownerDocument.defaultView.getComputedStyle( source ).direction;

			this.left += borderWidths.left;
			this.top += borderWidths.top;
			this.right -= borderWidths.right;
			this.bottom -= borderWidths.bottom;
			this.width = this.right - this.left;
			this.height = this.bottom - this.top;
		}

		this.width -= scrollBarWidth;

		if ( direction === 'ltr' ) {
			this.right -= scrollBarWidth;
		} else {
			this.left += scrollBarWidth;
		}

		this.height -= scrollBarHeight;
		this.bottom -= scrollBarHeight;

		return this;
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
		// https://github.com/ckeditor/ckeditor5-ui/issues/317
		else {
			let startContainer = range.startContainer;

			if ( isText( startContainer ) ) {
				startContainer = startContainer.parentNode;
			}

			const rect = new Rect( startContainer.getBoundingClientRect() );
			rect.right = rect.left;
			rect.width = 0;

			rects.push( rect );
		}

		return rects;
	}

	/**
	 * Returns a bounding rectangle that contains all the given `rects`.
	 *
	 * @param {Iterable.<module:utils/dom/rect~Rect>} rects A list of rectangles that should be contained in the result rectangle.
	 * @returns {module:utils/dom/rect~Rect|null} Bounding rectangle or `null` if no `rects` were given.
	 */
	static getBoundingRect( rects ) {
		const boundingRectData = {
			left: Number.POSITIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY
		};
		let rectangleCount = 0;

		for ( const rect of rects ) {
			rectangleCount++;

			boundingRectData.left = Math.min( boundingRectData.left, rect.left );
			boundingRectData.top = Math.min( boundingRectData.top, rect.top );
			boundingRectData.right = Math.max( boundingRectData.right, rect.right );
			boundingRectData.bottom = Math.max( boundingRectData.bottom, rect.bottom );
		}

		if ( rectangleCount == 0 ) {
			return null;
		}

		boundingRectData.width = boundingRectData.right - boundingRectData.left;
		boundingRectData.height = boundingRectData.bottom - boundingRectData.top;

		return new Rect( boundingRectData );
	}
}

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

// Checks if provided object is a <body> HTML element.
//
// @private
// @param {HTMLElement|Range} elementOrRange
// @returns {Boolean}
function isBody( elementOrRange ) {
	if ( !isElement( elementOrRange ) ) {
		return false;
	}

	return elementOrRange === elementOrRange.ownerDocument.body;
}
