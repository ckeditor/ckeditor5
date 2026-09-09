/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getrangefrommouseevent
 */

import { isNativeShadowRoot } from './isshadowroot.js';

/**
 * `Document#caretPositionFromPoint()` with the `shadowRoots` option (Chrome 128+) is not yet part of the
 * TypeScript DOM typings, so the members this module relies on are declared here.
 */
interface DocumentWithCaretPositionFromPoint {
	caretPositionFromPoint?( x: number, y: number, options?: { shadowRoots?: Array<ShadowRoot> } ): {
		offsetNode: Node;
		offset: number;
	} | null;
}

/**
 * Returns a DOM range from a given point specified by a mouse event.
 *
 * **Note**: The point is resolved inside the shadow root the event was dispatched in, so a click inside a shadow
 * tree gives a range in that tree rather than one at its host. Works for open and closed shadow roots alike, on
 * the engines that honor the `shadowRoots` option of `Document#caretPositionFromPoint()`; elsewhere the range
 * still lands beside the host.
 *
 * @param domEvent The mouse event.
 * @returns The DOM range.
 */
export function getRangeFromMouseEvent(
	domEvent: MouseEvent & {
		rangeParent?: HTMLElement;
		rangeOffset?: number;
	}
): Range | null {
	if ( !domEvent.target ) {
		return null;
	}

	const domTarget = domEvent.target as HTMLElement;
	const domDoc: Document & DocumentWithCaretPositionFromPoint = domTarget.ownerDocument;

	const x = domEvent.clientX;
	const y = domEvent.clientY;
	let domRange = null;

	if ( domDoc.caretPositionFromPoint ) {
		// `caretPositionFromPoint()` hit-tests down to the deepest node, then retargets up to the host
		// until it reaches a listed shadow root, so only the target's own root has to be passed.
		const rootNode = domTarget.getRootNode();
		const shadowRoots = isNativeShadowRoot( rootNode ) ? [ rootNode ] : [];
		// The `shadowRoots` option is honored by Chrome and Edge 128+, Firefox 150+, and Safari 26.2+.
		// Older engines that expose the method ignore the option and cannot pierce the shadow boundary:
		// the resolved position is then the retargeted shadow host in the light DOM. There is no piercing
		// fallback for this case — unlike `getElementFromPoint()` — because `caretRangeFromPoint()` below
		// also ignores Shadow DOM, and `elementFromPoint()` yields an element without the caret offset a
		// range needs.
		const caretPosition = domDoc.caretPositionFromPoint( x, y, { shadowRoots } );

		if ( caretPosition ) {
			const offsetNode = caretPosition.offsetNode;

			// Chrome's `caretPositionFromPoint()` can return an offset that is out of bounds for the
			// returned node (e.g. a non-zero offset on a childless element like `<img>`), which would
			// make `Range#setStart()` throw an `IndexSizeError` and abort the calling handler
			// (for example during dragover/drop). Clamp the offset to a value valid for the node type.
			const maxOffset = offsetNode.nodeType === Node.TEXT_NODE ?
				( offsetNode as Text ).data.length :
				offsetNode.childNodes.length;

			const offset = Math.min( caretPosition.offset, maxOffset );

			domRange = domDoc.createRange();
			domRange.setStart( offsetNode, offset );
			domRange.collapse( true );
		}
	}

	// Webkit & Blink.
	else if ( domDoc.caretRangeFromPoint && domDoc.caretRangeFromPoint( x, y ) ) {
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
