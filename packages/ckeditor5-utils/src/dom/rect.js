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

const rectProperties = [ 'top', 'right', 'bottom', 'left', 'width', 'height' ];

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
	 * @param {HTMLElement|Range|ClientRect|module:utils/dom/rect~Rect|Object} source A source object to create the rect.
	 */
	constructor( source ) {
		/**
		 * The object this rect is for.
		 *
		 * @protected
		 * @readonly
		 * @member {HTMLElement|Range|ClientRect|module:utils/dom/rect~Rect|Object} #_source
		 */
		Object.defineProperty( this, '_source', {
			// source._source if already the Rect instance
			value: source._source || source,
			writable: false,
			enumerable: false
		} );

		if ( isElement( source ) || isRange( source ) ) {
			source = source.getBoundingClientRect();
		}

		rectProperties.forEach( p => this[ p ] = source[ p ] );

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
	 * Returns a rect of the web browser viewport.
	 *
	 * @returns {module:utils/dom/rect~Rect} A viewport rect.
	 */
	static getViewportRect() {
		const { innerWidth, innerHeight } = global.window;

		return new Rect( {
			top: 0,
			right: innerWidth,
			bottom: innerHeight,
			left: 0,
			width: innerWidth,
			height: innerHeight
		} );
	}
}
