/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/utils/calculatehostwidth
 */

import type { Rect } from '@ckeditor/ckeditor5-utils';

/**
 * Searches up to 5 levels above the specified element and returns the width of the found ancestor element.
 *
 * @param domResizeHost Resize host DOM element.
 * @returns Width of ancestor element.
 */
export function calculateResizeHostAncestorWidth( domResizeHost: HTMLElement ): number {
	const domResizeHostParent = domResizeHost.parentElement;

	// Need to use computed style as it properly excludes parent's paddings from the returned value.
	let parentWidth = parseFloat( domResizeHostParent!.ownerDocument.defaultView!.getComputedStyle( domResizeHostParent! ).width );

	// Sometimes parent width cannot be accessed. If that happens we should go up in the elements tree
	// and try to get width from next ancestor.
	// https://github.com/ckeditor/ckeditor5/issues/10776
	const ancestorLevelLimit = 5;
	let currentLevel = 0;

	let checkedElement = domResizeHostParent!;

	while ( isNaN( parentWidth ) ) {
		checkedElement = checkedElement.parentElement!;

		if ( ++currentLevel > ancestorLevelLimit ) {
			return 0;
		}

		parentWidth = parseFloat(
				domResizeHostParent!.ownerDocument.defaultView!.getComputedStyle( checkedElement ).width
		);
	}

	return parentWidth;
}

/**
 * Calculates a relative width of a `domResizeHost` compared to its ancestor in percents.
 *
 * @param domResizeHost Resize host DOM element.
 * @returns Percentage value between 0 and 100.
 */
export function calculateResizeHostPercentageWidth(
	domResizeHost: HTMLElement,
	resizeHostRect: Rect
): number {
	const parentWidth = calculateResizeHostAncestorWidth( domResizeHost );

	if ( !parentWidth ) {
		return 0;
	}

	return resizeHostRect.width / parentWidth * 100;
}
