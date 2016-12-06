/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, Range, HTMLElement */

/**
 * @module utils/dom/rect
 */

/**
 * A helper class representing a `DOMRect` object, e.g. value returned by
 * the native `object.getBoundingClientRect()` method. Provides a set of methods
 * to manipulate the rect and compare it against other `Rect` instances.
 *
 * @memberOf utils.dom
 */
export default class Rect {
	/**
	 * Creates an instance of rect.
	 *
	 * 		// Rect of an HTMLElement.
	 * 		const rectA = new Rect( document.body );
	 *
	 * 		// Rect of a DOM Range.
	 * 		const rectB = new Rect( document.getSelection().getRangeAt( 0 ) );
	 *
	 * 		// Rect out of an object.
	 * 		const rectC = new Rect( { top: 0, right: 10, bottom: 10, left: 0, width: 10, height: 10 } );
	 *
	 * 		// Rect out of another Rect instance.
	 * 		const rectC = new Rect( rectC );
	 *
	 * @param {HTMLElement|Range|utils.dom.Rect|Object} obj A source object to create the rect.
	 */
	constructor( obj ) {
		Object.assign( this, getRect( obj ) );

		/**
		 * The "top" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#top
		 */

		/**
		 * The "right" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#right
		 */

		/**
		 * The "bottom" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#bottom
		 */

		/**
		 * The "left" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#left
		 */

		/**
		 * The "width" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#width
		 */

		/**
		 * The "height" value of the rect.
		 *
		 * @readonly
		 * @member {Number} utils.dom.Rect#height
		 */
	}

	/**
	 * Returns a clone of the rect.
	 *
	 * @returns {utils.dom.Rect} A cloned rect.
	 */
	clone() {
		return new Rect( this );
	}

	/**
	 * Moves the rect so that its upper–left corner lands in desired `[ x, y ]` location.
	 *
	 * @param {Number} x Desired horizontal location.
	 * @param {Number} y Desired vertical location.
	 * @returns {utils.dom.Rect} A rect which has been moved.
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
	 * @returns {utils.dom.Rect} A rect which has been moved.
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
	 * @param {utils.dom.Rect} anotherRect
	 * @returns {utils.dom.Rect}
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

		return new Rect( rect );
	}

	/**
	 * Returns the area of intersection with another rect.
	 *
	 * @param {utils.dom.Rect} anotherRect [description]
	 * @returns {Number} Area of intersection.
	 */
	getIntersectionArea( anotherRect ) {
		return this.getIntersection( anotherRect ).getArea();
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
	 * Returns a rect of the web browser viewport.
	 *
	 * @returns {utils.dom.Rect} A viewport rect.
	 */
	static getViewportRect() {
		const { innerWidth, innerHeight } = window;

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

// Returns the client rect of an HTMLElement, Range, or rect. The obtained geometry of the rect
// corresponds with `position: absolute` relative to the `<body>` (`document.body`).
//
// @private
// @param {HTMLElement|Range|Object} object Target object witch rect is to be determined.
// @returns {Object} Client rect object.
function getRect( object ) {
	// A HTMLElement or DOM Range has been passed.
	if ( isDomElement( object ) || isDomRange( object ) ) {
		// De-structuring the native DOMRect.
		const { top, right, bottom, left, width, height } = object.getBoundingClientRect();

		return { top, right, bottom, left, width, height };
	}
	// A Rect instance or a rect–like object has been passed.
	else {
		return Object.assign( {}, object );
	}
}

// Checks if the object is a DOM Range.
//
// @private
// @param {*} obj
// @returns {Boolean}
function isDomRange( obj ) {
	return obj instanceof Range;
}

// Checks if the object is a DOM HTMLElement.
//
// @private
// @param {*} obj
// @returns {Boolean}
function isDomElement( obj ) {
	return obj instanceof HTMLElement;
}
