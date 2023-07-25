/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getelementsintersectionrect
 */

import Rect from './rect';

/**
 * Calculates the intersection `Rect` of a given set of elements (and/or a `document`).
 * Also, takes into account the viewport top offset configuration.
 *
 * @internal
 * @param elements
 * @param viewportTopOffset
 */
export default function getElementsIntersectionRect(
	elements: Array<HTMLElement | Document>,
	viewportTopOffset: number = 0
): Rect | null {
	const elementRects = elements.map( element => {
		// The document (window) is yet another "element", but cropped by the top offset.
		if ( element instanceof Document ) {
			const windowRect = new Rect( global.window );

			windowRect.top += viewportTopOffset;
			windowRect.height -= viewportTopOffset;

			return windowRect;
		} else {
			return new Rect( element );
		}
	} );

	let intersectionRect: Rect | null = elementRects[ 0 ];

	// @if CK_DEBUG_GETELEMENTSINTERSECTIONRECT // for ( const rect of elementRects ) {
	// @if CK_DEBUG_GETELEMENTSINTERSECTIONRECT // 	RectDrawer.draw( rect, {
	// @if CK_DEBUG_GETELEMENTSINTERSECTIONRECT // 		outlineWidth: '1px', opacity: '.7', outlineStyle: 'dashed'
	// @if CK_DEBUG_GETELEMENTSINTERSECTIONRECT // 	}, 'Scrollable element' );
	// @if CK_DEBUG_GETELEMENTSINTERSECTIONRECT // }

	for ( const rect of elementRects.slice( 1 ) ) {
		if ( intersectionRect ) {
			intersectionRect = intersectionRect.getIntersection( rect );
		}
	}

	return intersectionRect;
}
