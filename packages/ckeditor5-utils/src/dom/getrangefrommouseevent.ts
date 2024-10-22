/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getrangefrommouseevent
 */

import isShadowRoot from './isshadowroot.js';

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

	const domTarget = domEvent.target as HTMLElement;
	const domDoc = domTarget.ownerDocument;
	const domRootNode = domTarget.getRootNode();
	const x = domEvent.clientX;
	const y = domEvent.clientY;

	// TODO
	// Available in Chrome 128+
	if ( domDoc.caretPositionFromPoint && typeof domDoc.caretPositionFromPoint == 'function' ) {
		const shadowRoot = isShadowRoot( domRootNode ) ? domRootNode : null;
		const caretPosition = domDoc.caretPositionFromPoint( x, y, shadowRoot ? { shadowRoots: [ domRootNode ] } : {} );
		const domRange = domDoc.createRange();

		domRange.setStart( caretPosition.offsetNode, caretPosition.offset );
		domRange.collapse( true );

		return domRange;
	}

	// Webkit & Blink.
	if ( domDoc.caretRangeFromPoint && domDoc.caretRangeFromPoint( x, y ) ) {
		return domDoc.caretRangeFromPoint( x, y );
	}

	// FF.
	if ( domEvent.rangeParent ) {
		const domRange = domDoc.createRange();

		domRange.setStart( domEvent.rangeParent, domEvent.rangeOffset! );
		domRange.collapse( true );

		return domRange;
	}

	return null;
}
