/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getscrollableancestors
 */

import findClosestScrollableAncestor from './findclosestscrollableancestor';

/**
 * Collects all parents elements that are scrollable.
 *
 * @param element
 * @returns an array of scrollable ancestors.
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
