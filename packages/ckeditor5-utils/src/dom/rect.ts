/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/rect
 */

import isRange from './isrange.js';
import isWindow from './iswindow.js';
import getBorderWidths from './getborderwidths.js';
import isText from './istext.js';
import getPositionedAncestor from './getpositionedancestor.js';
import global from './global.js';

const rectProperties: Array<keyof RectLike> = [ 'top', 'right', 'bottom', 'left', 'width', 'height' ];

/**
 * A helper class representing a `ClientRect` object, e.g. value returned by
 * the native `object.getBoundingClientRect()` method. Provides a set of methods
 * to manipulate the rect and compare it against other rect instances.
 */
export default class Rect {
	/**
	 * The "top" value of the rect.
	 *
	 * @readonly
	 */
	public top!: number;

	/**
	 * The "right" value of the rect.
	 *
	 * @readonly
	 */
	public right!: number;

	/**
	 * The "bottom" value of the rect.
	 *
	 * @readonly
	 */
	public bottom!: number;

	/**
	 * The "left" value of the rect.
	 *
	 * @readonly
	 */
	public left!: number;

	/**
	 * The "width" value of the rect.
	 *
	 * @readonly
	 */
	public width!: number;

	/**
	 * The "height" value of the rect.
	 *
	 * @readonly
	 */
	public height!: number;

	/**
	 * The object this rect is for.
	 *
	 * @readonly
	 */
	private _source!: RectSource;

	/**
	 * Creates an instance of rect.
	 *
	 * ```ts
	 * // Rect of an HTMLElement.
	 * const rectA = new Rect( document.body );
	 *
	 * // Rect of a DOM Range.
	 * const rectB = new Rect( document.getSelection().getRangeAt( 0 ) );
	 *
	 * // Rect of a window (web browser viewport).
	 * const rectC = new Rect( window );
	 *
	 * // Rect out of an object.
	 * const rectD = new Rect( { top: 0, right: 10, bottom: 10, left: 0, width: 10, height: 10 } );
	 *
	 * // Rect out of another Rect instance.
	 * const rectE = new Rect( rectD );
	 *
	 * // Rect out of a ClientRect.
	 * const rectF = new Rect( document.body.getClientRects().item( 0 ) );
	 * ```
	 *
	 * **Note**: By default a rect of an HTML element includes its CSS borders and scrollbars (if any)
	 * ant the rect of a `window` includes scrollbars too. Use {@link #excludeScrollbarsAndBorders}
	 * to get the inner part of the rect.
	 *
	 * @param source A source object to create the rect.
	 */
	constructor( source: RectSource ) {
		const isSourceRange = isRange( source );

		Object.defineProperty( this, '_source', {
			// If the source is a Rect instance, copy it's #_source.
			value: ( source as any )._source || source,
			writable: true,
			enumerable: false
		} );

		if ( isDomElement( source ) || isSourceRange ) {
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
				copyRectProperties( this, Rect.getBoundingRect( rangeRects )! );
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
	}

	/**
	 * Returns a clone of the rect.
	 *
	 * @returns A cloned rect.
	 */
	public clone(): Rect {
		return new Rect( this );
	}

	/**
	 * Moves the rect so that its upper–left corner lands in desired `[ x, y ]` location.
	 *
	 * @param x Desired horizontal location.
	 * @param y Desired vertical location.
	 * @returns A rect which has been moved.
	 */
	public moveTo( x: number, y: number ): this {
		this.top = y;
		this.right = x + this.width;
		this.bottom = y + this.height;
		this.left = x;

		return this;
	}

	/**
	 * Moves the rect in–place by a dedicated offset.
	 *
	 * @param x A horizontal offset.
	 * @param y A vertical offset
	 * @returns A rect which has been moved.
	 */
	public moveBy( x: number, y: number ): this {
		this.top += y;
		this.right += x;
		this.left += x;
		this.bottom += y;

		return this;
	}

	/**
	 * Returns a new rect a a result of intersection with another rect.
	 */
	public getIntersection( anotherRect: Rect ): Rect | null {
		const rect = {
			top: Math.max( this.top, anotherRect.top ),
			right: Math.min( this.right, anotherRect.right ),
			bottom: Math.min( this.bottom, anotherRect.bottom ),
			left: Math.max( this.left, anotherRect.left ),
			width: 0,
			height: 0
		};

		rect.width = rect.right - rect.left;
		rect.height = rect.bottom - rect.top;

		if ( rect.width < 0 || rect.height < 0 ) {
			return null;
		} else {
			const newRect = new Rect( rect );

			newRect._source = this._source;

			return newRect;
		}
	}

	/**
	 * Returns the area of intersection with another rect.
	 *
	 * @returns Area of intersection.
	 */
	public getIntersectionArea( anotherRect: Rect ): number {
		const rect = this.getIntersection( anotherRect );

		if ( rect ) {
			return rect.getArea();
		} else {
			return 0;
		}
	}

	/**
	 * Returns the area of the rect.
	 */
	public getArea(): number {
		return this.width * this.height;
	}

	/**
	 * Returns a new rect, a part of the original rect, which is actually visible to the user and is relative to the,`body`,
	 * e.g. an original rect cropped by parent element rects which have `overflow` set in CSS
	 * other than `"visible"`.
	 *
	 * If there's no such visible rect, which is when the rect is limited by one or many of
	 * the ancestors, `null` is returned.
	 *
	 * **Note**: This method does not consider the boundaries of the viewport (window).
	 * To get a rect cropped by all ancestors and the viewport, use an intersection such as:
	 *
	 * ```ts
	 * const visibleInViewportRect = new Rect( window ).getIntersection( new Rect( source ).getVisible() );
	 * ```
	 *
	 * @returns A visible rect instance or `null`, if there's none.
	 */
	public getVisible(): Rect | null {
		const source: RectSource & { parentNode?: Node | null; commonAncestorContainer?: Node | null } = this._source;

		let visibleRect = this.clone();

		// There's no ancestor to crop <body> with the overflow.
		if ( isBody( source ) ) {
			return visibleRect;
		}

		let child: any = source;
		let parent = source.parentNode || source.commonAncestorContainer;
		let absolutelyPositionedChildElement;

		// Check the ancestors all the way up to the <body>.
		while ( parent && !isBody( parent ) ) {
			const isParentOverflowVisible = getElementOverflow( parent as HTMLElement ) === 'visible';

			if ( child instanceof HTMLElement && getElementPosition( child ) === 'absolute' ) {
				absolutelyPositionedChildElement = child;
			}

			const parentElementPosition = getElementPosition( parent );

			// The child will be cropped only if it has `position: absolute` and the parent has `position: relative` + some overflow.
			// Otherwise there's no chance of visual clipping and the parent can be skipped
			// https://github.com/ckeditor/ckeditor5/issues/14107.
			//
			// condition: isParentOverflowVisible
			// 		+---------------------------+
			//		| #parent					|
			//		| (overflow: visible)		|
			//		|				+-----------+---------------+
			//		|				| child						|
			//		|				+-----------+---------------+
			//		+---------------------------+
			//
			// condition: absolutelyPositionedChildElement && parentElementPosition === 'relative' && isParentOverflowVisible
			// 		+---------------------------+
			//		| parent					|
			//		| (position: relative;)		|
			//		| (overflow: visible;)		|
			//		|				+-----------+---------------+
			//		|				| child  					|
			//		|				| (position: absolute;)		|
			//		|				+-----------+---------------+
			//		+---------------------------+
			//
			// condition: absolutelyPositionedChildElement && parentElementPosition !== 'relative'
			// 		+---------------------------+
			//		| parent					|
			//		| (position: static;)		|
			//		|				+-----------+---------------+
			//		|				| child  					|
			//		|				| (position: absolute;)		|
			//		|				+-----------+---------------+
			//		+---------------------------+
			if (
				isParentOverflowVisible ||
				absolutelyPositionedChildElement && (
					( parentElementPosition === 'relative' && isParentOverflowVisible ) ||
					parentElementPosition !== 'relative'
				)
			) {
				child = parent;
				parent = parent.parentNode;
				continue;
			}

			const parentRect = new Rect( parent as HTMLElement );
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

			child = parent;
			parent = parent.parentNode;
		}

		return visibleRect;
	}

	/**
	 * Checks if all property values ({@link #top}, {@link #left}, {@link #right},
	 * {@link #bottom}, {@link #width} and {@link #height}) are the equal in both rect
	 * instances.
	 *
	 * @param anotherRect A rect instance to compare with.
	 * @returns `true` when Rects are equal. `false` otherwise.
	 */
	public isEqual( anotherRect: Rect ): boolean {
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
	 * @param anotherRect
	 * @returns `true` if contains, `false` otherwise.
	 */
	public contains( anotherRect: Rect ): boolean {
		const intersectRect = this.getIntersection( anotherRect );

		return !!( intersectRect && intersectRect.isEqual( anotherRect ) );
	}

	/**
	 * Recalculates screen coordinates to coordinates relative to the positioned ancestor offset.
	 */
	public toAbsoluteRect(): Rect {
		const { scrollX, scrollY } = global.window;
		const absoluteRect = this.clone().moveBy( scrollX, scrollY );

		if ( isDomElement( absoluteRect._source ) ) {
			const positionedAncestor = getPositionedAncestor( absoluteRect._source );

			if ( positionedAncestor ) {
				shiftRectToCompensatePositionedAncestor( absoluteRect, positionedAncestor );
			}
		}

		return absoluteRect;
	}

	/**
	 * Excludes scrollbars and CSS borders from the rect.
	 *
	 * * Borders are removed when {@link #_source} is an HTML element.
	 * * Scrollbars are excluded from HTML elements and the `window`.
	 *
	 * @returns A rect which has been updated.
	 */
	public excludeScrollbarsAndBorders(): this {
		const source = this._source as ( HTMLElement | Window );
		let scrollBarWidth, scrollBarHeight, direction;

		if ( isWindow( source ) ) {
			scrollBarWidth = source.innerWidth - source.document.documentElement.clientWidth;
			scrollBarHeight = source.innerHeight - source.document.documentElement.clientHeight;
			direction = source.getComputedStyle( source.document.documentElement ).direction;
		} else {
			const borderWidths = getBorderWidths( source );

			scrollBarWidth = source.offsetWidth - source.clientWidth - borderWidths.left - borderWidths.right;
			scrollBarHeight = source.offsetHeight - source.clientHeight - borderWidths.top - borderWidths.bottom;
			direction = source.ownerDocument.defaultView!.getComputedStyle( source ).direction;

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
	 * @param range A native DOM range.
	 * @returns DOM Range rects.
	 */
	public static getDomRangeRects( range: Range ): Array<Rect> {
		const rects: Array<Rect> = [];
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
				startContainer = startContainer.parentNode!;
			}

			const rect = new Rect( ( startContainer as Element ).getBoundingClientRect() );
			rect.right = rect.left;
			rect.width = 0;

			rects.push( rect );
		}

		return rects;
	}

	/**
	 * Returns a bounding rectangle that contains all the given `rects`.
	 *
	 * @param rects A list of rectangles that should be contained in the result rectangle.
	 * @returns Bounding rectangle or `null` if no `rects` were given.
	 */
	public static getBoundingRect( rects: Iterable<Rect> ): Rect | null {
		const boundingRectData = {
			left: Number.POSITIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY,
			width: 0,
			height: 0
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

/**
 * A source of {@link module:utils/dom/rect~Rect}.
 */
export type RectSource = HTMLElement | Range | Window | RectLike;

/**
 * An object that describes properties of `ClientRect` object.
 */
export interface RectLike {
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly left: number;
	readonly width: number;
	readonly height: number;
}

/**
 * Acquires all the rect properties from the passed source.
 */
function copyRectProperties( rect: Rect, source: RectLike ): void {
	for ( const p of rectProperties ) {
		rect[ p ] = source[ p ];
	}
}

/**
 * Checks if provided object is a <body> HTML element.
 */
function isBody( value: unknown ): value is HTMLBodyElement {
	if ( !isDomElement( value ) ) {
		return false;
	}

	return value === value.ownerDocument.body;
}

/**
 * Checks if provided object "looks like" a DOM Element and has API required by `Rect` class.
 */
function isDomElement( value: any ): value is Element {
	// Note: earlier we used `isElement()` from lodash library, however that function is less performant because
	// it makes complicated checks to make sure that given value is a DOM element.
	return value !== null && typeof value === 'object' && value.nodeType === 1 && typeof value.getBoundingClientRect === 'function';
}

/**
 * Returns the value of the `position` style of an `HTMLElement`.
 */
function getElementPosition( element: HTMLElement | Node ): string {
	return element instanceof HTMLElement ? element.ownerDocument.defaultView!.getComputedStyle( element ).position : 'static';
}

/**
 * Returns the value of the `overflow` style of an `HTMLElement` or a `Range`.
 */
function getElementOverflow( element: HTMLElement | Range ): string {
	return element instanceof HTMLElement ? element.ownerDocument.defaultView!.getComputedStyle( element ).overflow : 'visible';
}

/**
 * For a given absolute Rect coordinates object and a positioned element ancestor, it updates its
 * coordinates that make up for the position and the scroll of the ancestor.
 *
 * This is necessary because while Rects (and DOMRects) are relative to the browser's viewport, their coordinates
 * are used in real–life to position elements with `position: absolute`, which are scoped by any positioned
 * (and scrollable) ancestors.
 */
function shiftRectToCompensatePositionedAncestor( rect: Rect, positionedElementAncestor: HTMLElement ): void {
	const ancestorPosition = new Rect( positionedElementAncestor );
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
