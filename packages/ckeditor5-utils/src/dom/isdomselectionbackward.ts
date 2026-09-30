/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isdomselectionbackward
 */

import { type ShadowSelection } from './getselection.js';

/**
 * Returns `true` if the given selection is backward, that is, if its `focus` is positioned before its `anchor`.
 *
 * A replacement for reading `Selection#direction`, which is absent on older engines and reports `'none'` for a
 * selection made with the mouse inside a shadow root. The orientation is then recovered from the anchor and
 * focus positions instead, so an answer is always available.
 *
 * @param selection The selection to check.
 */
export function isDomSelectionBackward( selection: Selection | ShadowSelection ): boolean {
	if ( selection.isCollapsed ) {
		return false;
	}

	// A meaningful direction answers directly; only compare positions when it is unavailable or `'none'`.
	// `ShadowSelection` declares `direction` and a native `Selection` carries it at runtime on engines that
	// support it (`Selection#direction`: Chrome and Edge 137+, Firefox 126+, Safari 17+).
	if ( 'direction' in selection && selection.direction != 'none' ) {
		return selection.direction == 'backward';
	}

	// Since it takes multiple steps to check whether one "DOM Position" is before/after another "DOM Position",
	// use the fact that a range collapses when its end is placed before its start.
	const range = selection.anchorNode!.ownerDocument!.createRange();

	try {
		range.setStart( selection.anchorNode!, selection.anchorOffset );
		range.setEnd( selection.focusNode!, selection.focusOffset );
	} catch {
		// Safari sometimes gives us a selection that makes Range.set{Start,End} throw.
		// See https://github.com/ckeditor/ckeditor5/issues/12375.
		return false;
	}

	const backward = range.collapsed;

	range.detach();

	return backward;
}
