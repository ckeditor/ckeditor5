/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentcommandbehavior/indentlistitemusingclasses
 */

import { IndentUsingClasses } from './indentusingclasses.js';

/**
 * The list item block indentation behavior that resets class-based indentation toward zero.
 *
 * Unlike {@link module:indent/indentcommandbehavior/indentusingclasses~IndentUsingClasses}, this behavior
 * is enabled only in the backward (outdent) direction when a class-based indentation is set.
 * This is because class-based indentation values cannot be negative, so the only way to reset
 * them to zero is to remove the class by outdenting.
 *
 * @internal
 */
export class IndentListItemUsingClasses extends IndentUsingClasses {
	/**
	 * @inheritDoc
	 */
	public override checkEnabled( indentAttributeValue: string ): boolean {
		return !this.isForward && !!indentAttributeValue;
	}
}
