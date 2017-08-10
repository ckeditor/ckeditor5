/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Node */

/**
 * @module utils/dom/scroll
 */

import global from './global';
import isRange from './isrange';
import Rect from './rect';

const utils = {};

/**
 * Makes any page `HTMLElement` or `Range` (`target`) visible inside the browser viewport.
 * This helper will scroll all `target` ancestors and the web browser viewport to reveal the target to
 * the user. If the `target` is already visible, nothing will happen.
 *
 * @param {HTMLElement|Range} options.target A target, which supposed to become visible to the user.
 * @param {Number} [options.viewportOffset] An offset from the edge of the viewport (in pixels)
 * the `target` will be moved by when the viewport is scrolled. It enhances the user experience
 * by keeping the `target` some distance from the edge of the viewport and thus making it easier to
 * read or edit by the user.
 */
export function scrollViewportToShowTarget( { target, viewportOffset = 0 } ) {
	// Scroll the ancestors of the target to reveal it first, then focus on scrolling
	// the viewport, when the position of the target is fixed.
	utils.scrollAncestorsToShowTarget( target );

	const targetRect = new Rect( target );
	const targetShiftedDownRect = targetRect.clone().moveBy( 0, viewportOffset );
	const targetShiftedUpRect = targetRect.clone().moveBy( 0, -viewportOffset );
	const viewportRect = new Rect( global.window ).excludeScrollbarsAndBorders();

	// Avoid the situation where the caret is still in the viewport, but totally
	// at the edge. If it moved beyond the viewport in the next action e.g. due to enter,
	// the scrolling would move it to the viewportOffset level and it all would look like the
	// caret visually moved up/down.
	//
	// To prevent this, we're checking the rects moved by the viewportOffset to cover
	// the upper/lower edge of the viewport.
	const rects = [ targetShiftedUpRect, targetShiftedDownRect ];

	if ( !rects.every( rect => viewportRect.contains( rect ) ) ) {
		let { scrollX, scrollY } = global.window;

		if ( isAbove( targetShiftedUpRect, viewportRect ) ) {
			scrollY -= viewportRect.top - targetRect.top + viewportOffset;
		} else if ( isBelow( targetShiftedDownRect, viewportRect ) ) {
			scrollY += targetRect.bottom - viewportRect.bottom + viewportOffset;
		}

		// TODO: Web browsers scroll natively to place the target in the middle
		// of the viewport. It's not a very popular case, though.
		if ( isLeftOf( targetRect, viewportRect ) ) {
			scrollX -= viewportRect.left - targetRect.left + viewportOffset;
		} else if ( isRightOf( targetRect, viewportRect ) ) {
			scrollX += targetRect.right - viewportRect.right + viewportOffset;
		}

		global.window.scrollTo( scrollX, scrollY );
	}
}

/**
 * Makes any page `HTMLElement` or `Range` (target) visible within its scrollable ancestors,
 * e.g. if they have `overflow: scroll` CSS style.
 *
 * @param {HTMLElement|Range} target A target, which supposed to become visible to the user.
 */
export function scrollAncestorsToShowTarget( target ) {
	let parent, parentRect, targetRect;

	if ( isRange( target ) ) {
		parent = target.commonAncestorContainer;

		// If a Range is attached to the Text, use the closest element ancestor.
		if ( parent.nodeType == Node.TEXT_NODE ) {
			parent = parent.parentNode;
		}
	} else {
		parent = target.parentNode;
	}

	do {
		if ( parent === global.document.body ) {
			return;
		}

		targetRect = new Rect( target );
		parentRect = new Rect( parent ).excludeScrollbarsAndBorders();

		if ( !parentRect.contains( targetRect ) ) {
			scrollAncestorToShowTarget( { targetRect, parent, parentRect } );
		}
	} while ( ( parent = parent.parentNode ) );
}

// TODO: Using a property value shorthand in the top of the file
// causes JSDoc to throw errors. See https://github.com/cksource/docs-builder/issues/75.
Object.assign( utils, {
	scrollViewportToShowTarget,
	scrollAncestorsToShowTarget
} );

// For testing purposes (easy helper stubbing).
export { utils as _test };

// Makes any page `HTMLElement` or `Range` (target) visible within its parent.
//
// @private
// @param {module:utils/dom/rect~Rect} options.targetRect The `Rect` of the `target`.
// @param {HTMLElement} options.parent The parent element of the `target`.
// @param {module:utils/dom/rect~Rect} options.parentRect The `Rect` of the parent.
function scrollAncestorToShowTarget( { targetRect, parent, parentRect } ) {
	if ( isAbove( targetRect, parentRect ) ) {
		parent.scrollTop -= parentRect.top - targetRect.top;
	} else if ( isBelow( targetRect, parentRect ) ) {
		parent.scrollTop += targetRect.bottom - parentRect.bottom;
	}

	if ( isLeftOf( targetRect, parentRect ) ) {
		parent.scrollLeft -= parentRect.left - targetRect.left;
	} else if ( isRightOf( targetRect, parentRect ) ) {
		parent.scrollLeft += targetRect.right - parentRect.right;
	}
}

// Determines if a given `Rect` extends beyond the bottom edge of the second `Rect`.
//
// @private
// @param {module:utils/dom/rect~Rect} firstRect
// @param {module:utils/dom/rect~Rect} secondRect
function isBelow( firstRect, secondRect ) {
	return firstRect.bottom > secondRect.bottom;
}

// Determines if a given `Rect` extends beyond the top edge of the second `Rect`.
//
// @private
// @param {module:utils/dom/rect~Rect} firstRect
// @param {module:utils/dom/rect~Rect} secondRect
function isAbove( firstRect, secondRect ) {
	return firstRect.top < secondRect.top;
}

// Determines if a given `Rect` extends beyond the left edge of the second `Rect`.
//
// @private
// @param {module:utils/dom/rect~Rect} firstRect
// @param {module:utils/dom/rect~Rect} secondRect
function isLeftOf( firstRect, secondRect ) {
	return firstRect.left < secondRect.left;
}

// Determines if a given `Rect` extends beyond the right edge of the second `Rect`.
//
// @private
// @param {module:utils/dom/rect~Rect} firstRect
// @param {module:utils/dom/rect~Rect} secondRect
function isRightOf( firstRect, secondRect ) {
	return firstRect.right > secondRect.right;
}
