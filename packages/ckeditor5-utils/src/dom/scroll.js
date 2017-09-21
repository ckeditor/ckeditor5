/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Node */

/**
 * @module utils/dom/scroll
 */

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
	const targetWindow = getWindow( target );
	let currentWindow = targetWindow;
	let currentFrame = null;

	// Iterate over all windows, starting from target's parent window up to window#top.
	while ( currentWindow ) {
		let firstAncestorToScroll;

		// Let's scroll target's ancestors first to reveal it. Then, once the ancestor scrolls
		// settled down, the algorithm can eventually scroll the viewport of the current window.
		//
		// Note: If the current window is target's **original** window (e.g. the first one),
		// start scrolling the closest parent of the target. If not, scroll the closest parent
		// of an iframe that resides in the current window.
		if ( currentWindow == targetWindow ) {
			firstAncestorToScroll = getParentElement( target );
		} else {
			firstAncestorToScroll = getParentElement( currentFrame );
		}

		// Scroll the target's ancestors first. Once done, scrolling the viewport is easy.
		scrollAncestorsToShowRect( firstAncestorToScroll, () => {
			// Note: If the target does not belong to the current window **directly**,
			// i.e. it resides in an iframe belonging to the window, obtain the target's rect
			// in the coordinates of the current window. By default, a Rect returns geometry
			// relative to the current window's viewport. To make it work in a parent window,
			// it must be shifted.
			return getRectRelativeToWindow( target, currentWindow );
		} );

		// Obtain the rect of the target after it has been scrolled within its ancestors.
		// It's time to scroll the viewport.
		const targetRect = getRectRelativeToWindow( target, currentWindow );

		scrollWindowToShowRect( currentWindow, targetRect, viewportOffset );

		if ( currentWindow.parent != currentWindow ) {
			// Keep the reference to the <iframe> element the "previous current window" was
			// rendered within. It will be useful to re–calculate the rect of the target
			// in the parent window's relative geometry. The target's rect must be shifted
			// by it's iframe's position.
			currentFrame = currentWindow.frameElement;
			currentWindow = currentWindow.parent;
		} else {
			currentWindow = null;
		}
	}
}

/**
 * Makes any page `HTMLElement` or `Range` (target) visible within its scrollable ancestors,
 * e.g. if they have `overflow: scroll` CSS style.
 *
 * @param {HTMLElement|Range} target A target, which supposed to become visible to the user.
 */
export function scrollAncestorsToShowTarget( target ) {
	const targetParent = getParentElement( target );

	scrollAncestorsToShowRect( targetParent, () => {
		return new Rect( target );
	} );
}

// TODO: Using a property value shorthand in the top of the file
// causes JSDoc to throw errors. See https://github.com/cksource/docs-builder/issues/75.
Object.assign( utils, {
	scrollViewportToShowTarget,
	scrollAncestorsToShowTarget
} );

// Makes a given rect visible within its parent window.
//
// Note: Avoid the situation where the caret is still in the viewport, but totally
// at the edge of it. In such situation, if it moved beyond the viewport in the next
// action e.g. after paste, the scrolling would move it to the viewportOffset level
// and it all would look like the caret visually moved up/down:
//
// 1.
//		| foo[]
//		|                                    <--- N px of space below the caret
//		+---------------------------------...
//
// 2. *paste*
// 3.
//		|
//		|
//		+-foo-----------------------------...
//		  bar[]                              <--- caret below viewport, scrolling...
//
// 4. *scrolling*
// 5.
//		|
//		| foo
//		| bar[]                              <--- caret precisely at the edge
//		+---------------------------------...
//
// To prevent this, this method checks the rects moved by the viewportOffset to cover
// the upper/lower edge of the viewport. It makes sure if the action repeats, there's
// no twitching – it's a purely visual improvement:
//
// 5. (after fix)
//		|
//		| foo
//		| bar[]
//		|                                    <--- N px of space below the caret
//		+---------------------------------...
//
// @private
// @param {Window} window A window which is scrolled to reveal the rect.
// @param {module:utils/dom/rect~Rect} rect A rect which is to be revealed.
// @param {Number} viewportOffset See scrollViewportToShowTarget.
function scrollWindowToShowRect( window, rect, viewportOffset ) {
	const targetShiftedDownRect = rect.clone().moveBy( 0, viewportOffset );
	const targetShiftedUpRect = rect.clone().moveBy( 0, -viewportOffset );
	const viewportRect = new Rect( window ).excludeScrollbarsAndBorders();

	const rects = [ targetShiftedUpRect, targetShiftedDownRect ];

	if ( !rects.every( rect => viewportRect.contains( rect ) ) ) {
		let { scrollX, scrollY } = window;

		if ( isAbove( targetShiftedUpRect, viewportRect ) ) {
			scrollY -= viewportRect.top - rect.top + viewportOffset;
		} else if ( isBelow( targetShiftedDownRect, viewportRect ) ) {
			scrollY += rect.bottom - viewportRect.bottom + viewportOffset;
		}

		// TODO: Web browsers scroll natively to place the target in the middle
		// of the viewport. It's not a very popular case, though.
		if ( isLeftOf( rect, viewportRect ) ) {
			scrollX -= viewportRect.left - rect.left + viewportOffset;
		} else if ( isRightOf( rect, viewportRect ) ) {
			scrollX += rect.right - viewportRect.right + viewportOffset;
		}

		window.scrollTo( scrollX, scrollY );
	}
}

// Recursively scrolls element ancestors to visually reveal a rect.
//
// @private
// @param {HTMLElement} A parent The first ancestors to start scrolling.
// @param {Function} getRect A function which returns the Rect, which is to be revealed.
function scrollAncestorsToShowRect( parent, getRect ) {
	const parentWindow = getWindow( parent );
	let parentRect, targetRect;

	while ( parent != parentWindow.document.body ) {
		targetRect = getRect();
		parentRect = new Rect( parent ).excludeScrollbarsAndBorders();

		if ( !parentRect.contains( targetRect ) ) {
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

		parent = parent.parentNode;
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

// Returns the closest window of an element or range.
//
// @private
// @param {HTMLElement|Range} firstRect
// @returns {Window}
function getWindow( elementOrRange ) {
	if ( isRange( elementOrRange ) ) {
		return elementOrRange.startContainer.ownerDocument.defaultView;
	} else {
		return elementOrRange.ownerDocument.defaultView;
	}
}

// Returns the closest parent of an element or DOM range.
//
// @private
// @param {HTMLElement|Range} firstRect
// @returns {HTMLelement}
function getParentElement( elementOrRange ) {
	if ( isRange( elementOrRange ) ) {
		let parent = elementOrRange.commonAncestorContainer;

		// If a Range is attached to the Text, use the closest element ancestor.
		if ( parent.nodeType == Node.TEXT_NODE ) {
			parent = parent.parentNode;
		}

		return parent;
	} else {
		return elementOrRange.parentNode;
	}
}

// Returns the rect of an element or range residing in an iframe.
// The result rect is relative to the geometry of the passed window instance.
//
// @private
// @param {HTMLElement|Range} target Element or range which rect should be returned.
// @param {Window} relativeWindow A window the rect should be relative to.
// @returns {module:utils/dom/rect~Rect}
function getRectRelativeToWindow( target, relativeWindow ) {
	const targetWindow = getWindow( target );
	const rect = new Rect( target );

	if ( targetWindow === relativeWindow ) {
		return rect;
	} else {
		let currentWindow = targetWindow;

		while ( currentWindow != relativeWindow ) {
			const frame = currentWindow.frameElement;
			const frameRect = new Rect( frame ).excludeScrollbarsAndBorders();

			rect.moveBy( frameRect.left, frameRect.top );

			currentWindow = currentWindow.parent;
		}
	}

	return rect;
}
