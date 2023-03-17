/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/scroll
 */

import isRange from './isrange';
import Rect from './rect';
import isText from './istext';

type IfTrue<T> = T extends true ? true : never;

/**
 * Makes any page `HTMLElement` or `Range` (`target`) visible inside the browser viewport.
 * This helper will scroll all `target` ancestors and the web browser viewport to reveal the target to
 * the user. If the `target` is already visible, nothing will happen.
 *
 * @param options Additional configuration of the scrolling behavior.
 * @param options.target A target, which supposed to become visible to the user.
 * @param options.viewportOffset An offset from the edge of the viewport (in pixels)
 * the `target` will be moved by if the viewport is scrolled. It enhances the user experience
 * by keeping the `target` some distance from the edge of the viewport and thus making it easier to
 * read or edit by the user.
 * @param options.ancestorOffset An offset from the boundary of scrollable ancestors (if any)
 * the `target` will be moved by if the viewport is scrolled. It enhances the user experience
 * by keeping the `target` some distance from the edge of the ancestors and thus making it easier to
 * read or edit by the user.
 * @param options.alignToTop When set `true`, the helper will make sure the `target` is scrolled up
 * to the top boundary of the viewport and/or scrollable ancestors if scrolled up. When not set
 * (default), the `target` will be revealed by scrolling as little as possible. This option will
 * not affect `targets` that must be scrolled down because they will appear at the top of the boundary
 * anyway.
 *
 * ```
 *                                             scrollViewportToShowTarget() with            scrollViewportToShowTarget() with
 *          Initial state                        alignToTop unset (default)                        alignToTop = true
 *
 * ┌────────────────────────────────┬─┐       ┌────────────────────────────────┬─┐        ┌────────────────────────────────┬─┐
 * │                                │▲│       │                                │▲│        │   [ Target to be revealed ]    │▲│
 * │                                │ │       │                                │ │        │                                │ │
 * │                                │█│       │                                │ │        │                                │ │
 * │                                │█│       │                                │ │        │                                │ │
 * │                                │ │       │                                │█│        │                                │ │
 * │                                │ │       │                                │█│        │                                │█│
 * │                                │ │       │                                │ │        │                                │█│
 * │                                │▼│       │   [ Target to be revealed ]    │▼│        │                                │▼│
 * └────────────────────────────────┴─┘       └────────────────────────────────┴─┘        └────────────────────────────────┴─┘
 *
 *
 *     [ Target to be revealed ]
 *```
 *
 * @param options.forceScroll When set `true`, the `target` will be aligned to the top of the viewport
 * and scrollable ancestors whether it is already visible or not. This option will only work when `alignToTop`
 * is `true`
 */
export function scrollViewportToShowTarget<T extends boolean, U extends IfTrue<T>>(
	{
		target,
		viewportOffset = 0,
		ancestorOffset = 0,
		alignToTop,
		forceScroll
	}:
	{
		readonly target: HTMLElement | Range;
		readonly viewportOffset?: number;
		readonly ancestorOffset?: number;
		readonly alignToTop?: T;
		readonly forceScroll?: U;
	}
): void {
	const targetWindow = getWindow( target );
	let currentWindow: Window | null = targetWindow;
	let currentFrame: HTMLElement | null = null;

	// Iterate over all windows, starting from target's parent window up to window#top.
	while ( currentWindow ) {
		let firstAncestorToScroll: HTMLElement;

		// Let's scroll target's ancestors first to reveal it. Then, once the ancestor scrolls
		// settled down, the algorithm can eventually scroll the viewport of the current window.
		//
		// Note: If the current window is target's **original** window (e.g. the first one),
		// start scrolling the closest parent of the target. If not, scroll the closest parent
		// of an iframe that resides in the current window.
		if ( currentWindow == targetWindow ) {
			firstAncestorToScroll = getParentElement( target );
		} else {
			firstAncestorToScroll = getParentElement( currentFrame! );
		}

		// Scroll the target's ancestors first. Once done, scrolling the viewport is easy.
		scrollAncestorsToShowRect( {
			parent: firstAncestorToScroll,
			getRect: () => {
				// Note: If the target does not belong to the current window **directly**,
				// i.e. it resides in an iframe belonging to the window, obtain the target's rect
				// in the coordinates of the current window. By default, a Rect returns geometry
				// relative to the current window's viewport. To make it work in a parent window,
				// it must be shifted.
				return getRectRelativeToWindow( target, currentWindow! );
			},
			alignToTop,
			ancestorOffset,
			forceScroll
		} );

		// Obtain the rect of the target after it has been scrolled within its ancestors.
		// It's time to scroll the viewport.
		const targetRect = getRectRelativeToWindow( target, currentWindow );

		scrollWindowToShowRect( {
			window: currentWindow,
			rect: targetRect,
			viewportOffset,
			alignToTop,
			forceScroll
		} );

		if ( currentWindow.parent != currentWindow ) {
			// Keep the reference to the <iframe> element the "previous current window" was
			// rendered within. It will be useful to re–calculate the rect of the target
			// in the parent window's relative geometry. The target's rect must be shifted
			// by it's iframe's position.
			currentFrame = currentWindow.frameElement as HTMLElement | null;
			currentWindow = currentWindow.parent;

			// If the current window has some parent but frameElement is inaccessible, then they have
			// different domains/ports and, due to security reasons, accessing and scrolling
			// the parent window won't be possible.
			// See https://github.com/ckeditor/ckeditor5/issues/930.
			if ( !currentFrame ) {
				return;
			}
		} else {
			currentWindow = null;
		}
	}
}

/**
 * Makes any page `HTMLElement` or `Range` (target) visible within its scrollable ancestors,
 * e.g. if they have `overflow: scroll` CSS style.
 *
 * @param target A target, which supposed to become visible to the user.
 * @param ancestorOffset An offset between the target and the boundary of scrollable ancestors
 * to be maintained while scrolling.
 */
export function scrollAncestorsToShowTarget( target: HTMLElement | Range, ancestorOffset?: number ): void {
	const targetParent = getParentElement( target );

	scrollAncestorsToShowRect( {
		parent: targetParent,
		getRect: () => new Rect( target ),
		ancestorOffset
	} );
}

/**
 * Makes a given rect visible within its parent window.
 *
 * Note: Avoid the situation where the caret is still in the viewport, but totally
 * at the edge of it. In such situation, if it moved beyond the viewport in the next
 * action e.g. after paste, the scrolling would move it to the viewportOffset level
 * and it all would look like the caret visually moved up/down:
 *
 * 1.
 * ```
 * | foo[]
 * |                                    <--- N px of space below the caret
 * +---------------------------------...
 * ```
 *
 * 2. *paste*
 * 3.
 * ```
 * |
 * |
 * +-foo-----------------------------...
 *   bar[]                              <--- caret below viewport, scrolling...
 * ```
 *
 * 4. *scrolling*
 * 5.
 * ```
 * |
 * | foo
 * | bar[]                              <--- caret precisely at the edge
 * +---------------------------------...
 * ```
 *
 * To prevent this, this method checks the rects moved by the viewportOffset to cover
 * the upper/lower edge of the viewport. It makes sure if the action repeats, there's
 * no twitching – it's a purely visual improvement:
 *
 * 5. (after fix)
 * ```
 * |
 * | foo
 * | bar[]
 * |                                    <--- N px of space below the caret
 * +---------------------------------...
 * ```
 *
 * @param options Additional configuration of the scrolling behavior.
 * @param options.window A window which is scrolled to reveal the rect.
 * @param options.rect A rect which is to be revealed.
 * @param options.viewportOffset An offset from the edge of the viewport (in pixels) the `rect` will be
 * moved by if the viewport is scrolled.
 * @param options.alignToTop When set `true`, the helper will make sure the `rect` is scrolled up
 * to the top boundary of the viewport if scrolled up. When not set (default), the `rect` will be
 * revealed by scrolling as little as possible. This option will not affect rects that must be scrolled
 * down because they will appear at the top of the boundary anyway.
 * @param options.forceScroll When set `true`, the `rect` will be aligned to the top of the viewport
 * whether it is already visible or not. This option will only work when `alignToTop` is `true`
 */
function scrollWindowToShowRect<T extends boolean, U extends IfTrue<T>>(
	{
		window,
		rect,
		alignToTop,
		forceScroll,
		viewportOffset
	}: {
		readonly window: Window;
		readonly rect: Rect;
		readonly viewportOffset: number;
		readonly alignToTop?: T;
		readonly forceScroll?: U;
	}
): void {
	const targetShiftedDownRect = rect.clone().moveBy( 0, viewportOffset );
	const targetShiftedUpRect = rect.clone().moveBy( 0, -viewportOffset );
	const viewportRect = new Rect( window ).excludeScrollbarsAndBorders();

	const rects = [ targetShiftedUpRect, targetShiftedDownRect ];
	const forceScrollToTop = alignToTop && forceScroll;
	const allRectsFitInViewport = rects.every( rect => viewportRect.contains( rect ) );

	let { scrollX, scrollY } = window;
	const initialScrollX = scrollX;
	const initialScrollY = scrollY;

	if ( forceScrollToTop ) {
		scrollY -= ( viewportRect.top - rect.top ) + viewportOffset;
	} else if ( !allRectsFitInViewport ) {
		if ( isAbove( targetShiftedUpRect, viewportRect ) ) {
			scrollY -= viewportRect.top - rect.top + viewportOffset;
		} else if ( isBelow( targetShiftedDownRect, viewportRect ) ) {
			if ( alignToTop ) {
				scrollY += rect.top - viewportRect.top - viewportOffset;
			} else {
				scrollY += rect.bottom - viewportRect.bottom + viewportOffset;
			}
		}
	}

	if ( !allRectsFitInViewport ) {
		// TODO: Web browsers scroll natively to place the target in the middle
		// of the viewport. It's not a very popular case, though.
		if ( isLeftOf( rect, viewportRect ) ) {
			scrollX -= viewportRect.left - rect.left + viewportOffset;
		} else if ( isRightOf( rect, viewportRect ) ) {
			scrollX += rect.right - viewportRect.right + viewportOffset;
		}
	}

	if ( scrollX != initialScrollX || scrollY !== initialScrollY ) {
		window.scrollTo( scrollX, scrollY );
	}
}

/**
 * Recursively scrolls element ancestors to visually reveal a rect.
 *
 * @param options Additional configuration of the scrolling behavior.
 * @param options.parent The first parent ancestor to start scrolling.
 * @param options.getRect A function which returns the Rect, which is to be revealed.
 * @param options.ancestorOffset An offset from the boundary of scrollable ancestors (if any)
 * the `Rect` instance will be moved by if the viewport is scrolled.
 * @param options.alignToTop When set `true`, the helper will make sure the `Rect` instance is scrolled up
 * to the top boundary of the scrollable ancestors if scrolled up. When not set (default), the `rect`
 * will be revealed by scrolling as little as possible. This option will not affect rects that must be
 * scrolled down because they will appear at the top of the boundary
 * anyway.
 * @param options.forceScroll When set `true`, the `rect` will be aligned to the top of scrollable ancestors
 * whether it is already visible or not. This option will only work when `alignToTop` is `true`
 */
function scrollAncestorsToShowRect<T extends boolean, U extends IfTrue<T>>(
	{
		parent,
		getRect,
		alignToTop,
		forceScroll,
		ancestorOffset = 0
	}: {
		readonly parent: HTMLElement;
		readonly getRect: () => Rect;
		readonly alignToTop?: T;
		readonly forceScroll?: U;
		readonly ancestorOffset?: number;
	}
): void {
	const parentWindow = getWindow( parent );
	const forceScrollToTop = alignToTop && forceScroll;
	let parentRect: Rect, targetRect: Rect, targetFitsInTarget: boolean;

	while ( parent != parentWindow.document.body ) {
		targetRect = getRect();
		parentRect = new Rect( parent ).excludeScrollbarsAndBorders();
		targetFitsInTarget = parentRect.contains( targetRect );

		if ( forceScrollToTop ) {
			parent.scrollTop -= ( parentRect.top - targetRect.top ) + ancestorOffset;
		} else if ( !targetFitsInTarget ) {
			if ( isAbove( targetRect, parentRect ) ) {
				parent.scrollTop -= parentRect.top - targetRect.top + ancestorOffset;
			} else if ( isBelow( targetRect, parentRect ) ) {
				if ( alignToTop ) {
					parent.scrollTop += targetRect.top - parentRect.top - ancestorOffset;
				} else {
					parent.scrollTop += targetRect.bottom - parentRect.bottom + ancestorOffset;
				}
			}
		}

		if ( !targetFitsInTarget ) {
			if ( isLeftOf( targetRect, parentRect ) ) {
				parent.scrollLeft -= parentRect.left - targetRect.left + ancestorOffset;
			} else if ( isRightOf( targetRect, parentRect ) ) {
				parent.scrollLeft += targetRect.right - parentRect.right + ancestorOffset;
			}
		}

		parent = parent.parentNode as HTMLElement;
	}
}

/**
 * Determines if a given `Rect` extends beyond the bottom edge of the second `Rect`.
 */
function isBelow( firstRect: Rect, secondRect: Rect ): boolean {
	return firstRect.bottom > secondRect.bottom;
}

/**
 * Determines if a given `Rect` extends beyond the top edge of the second `Rect`.
 */
function isAbove( firstRect: Rect, secondRect: Rect ): boolean {
	return firstRect.top < secondRect.top;
}

/**
 * Determines if a given `Rect` extends beyond the left edge of the second `Rect`.
 */
function isLeftOf( firstRect: Rect, secondRect: Rect ): boolean {
	return firstRect.left < secondRect.left;
}

/**
 * Determines if a given `Rect` extends beyond the right edge of the second `Rect`.
 */
function isRightOf( firstRect: Rect, secondRect: Rect ): boolean {
	return firstRect.right > secondRect.right;
}

/**
 * Returns the closest window of an element or range.
 */
function getWindow( elementOrRange: HTMLElement | Range ): Window {
	if ( isRange( elementOrRange ) ) {
		return elementOrRange.startContainer.ownerDocument!.defaultView!;
	} else {
		return elementOrRange.ownerDocument.defaultView!;
	}
}

/**
 * Returns the closest parent of an element or DOM range.
 */
function getParentElement( elementOrRange: HTMLElement | Range ): HTMLElement {
	if ( isRange( elementOrRange ) ) {
		let parent = elementOrRange.commonAncestorContainer as HTMLElement;

		// If a Range is attached to the Text, use the closest element ancestor.
		if ( isText( parent ) ) {
			parent = parent.parentNode as HTMLElement;
		}

		return parent;
	} else {
		return elementOrRange.parentNode as HTMLElement;
	}
}

/**
 * Returns the rect of an element or range residing in an iframe.
 * The result rect is relative to the geometry of the passed window instance.
 *
 * @param target Element or range which rect should be returned.
 * @param relativeWindow A window the rect should be relative to.
 */
function getRectRelativeToWindow( target: HTMLElement | Range, relativeWindow: Window ): Rect {
	const targetWindow = getWindow( target );
	const rect = new Rect( target );

	if ( targetWindow === relativeWindow ) {
		return rect;
	} else {
		let currentWindow = targetWindow;

		while ( currentWindow != relativeWindow ) {
			const frame = currentWindow.frameElement as HTMLElement;
			const frameRect = new Rect( frame ).excludeScrollbarsAndBorders();

			rect.moveBy( frameRect.left, frameRect.top );

			currentWindow = currentWindow.parent;
		}
	}

	return rect;
}
