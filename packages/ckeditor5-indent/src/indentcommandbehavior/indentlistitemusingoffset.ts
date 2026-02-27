/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentcommandbehavior/indentlistitemusingoffset
 */

import { IndentUsingOffset } from './indentusingoffset.js';

/**
 * The list item block indentation behavior that resets offset-based indentation toward zero.
 *
 * Unlike {@link module:indent/indentcommandbehavior/indentusingoffset~IndentUsingOffset}, this behavior
 * is enabled only when the current indentation value can be moved toward zero:
 * - for forward direction only when the current offset is negative,
 * - for backward direction only when the current offset is positive.
 *
 * @internal
 */
export class IndentListItemUsingOffset extends IndentUsingOffset {
	/**
	 * @inheritDoc
	 */
	public override checkEnabled( indentAttributeValue: string ): boolean {
		const currentOffset = parseFloat( indentAttributeValue );

		return this.isForward && currentOffset < 0 || !this.isForward && currentOffset > 0;
	}
}
