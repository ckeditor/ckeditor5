/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getrangefrommouseevent
 */

/**
 * Returns a DOM range from a given point specified by a mouse event.
 *
 * @param domEvent The mouse event.
 * @returns The DOM range.
 */
export default function getRangeFromMouseEvent(
	domEvent: MouseEvent & {
		rangeParent?: HTMLElement;
		rangeOffset?: number;
	}
): Range | null {
	if ( !domEvent.target ) {
		return null;
	}

	const domDoc = ( domEvent.target as HTMLElement ).ownerDocument;
	const x = domEvent.clientX;
	const y = domEvent.clientY;
	let domRange = null;

	// Webkit & Blink.
	if ( domDoc.caretRangeFromPoint && domDoc.caretRangeFromPoint( x, y ) ) {
		domRange = domDoc.caretRangeFromPoint( x, y );
	}

	// FF.
	else if ( domEvent.rangeParent ) {
		domRange = domDoc.createRange();
		domRange.setStart( domEvent.rangeParent, domEvent.rangeOffset! );
		domRange.collapse( true );
	}

	return domRange;
}
