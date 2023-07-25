/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getscrollableancestors
 */

import global from './global';
import findClosestScrollableAncestor from './findclosestscrollableancestor';

/**
 * Loops over the given element's ancestors to find all the scrollable elements.
 *
 * **Note**: The `document` is always included in the returned array.
 *
 * @internal
 * @param element
 * @returns An array of scrollable element's ancestors (including the `document`).
 */
export default function getScrollableAncestors( element: HTMLElement ): Array<HTMLElement | Document> {
	const scrollableAncestors = [];
	let scrollableAncestor = findClosestScrollableAncestor( element );

	while ( scrollableAncestor && scrollableAncestor !== global.document.body ) {
		scrollableAncestors.push( scrollableAncestor );
		scrollableAncestor = findClosestScrollableAncestor( scrollableAncestor! );
	}

	scrollableAncestors.push( global.document );

	return scrollableAncestors;
}
