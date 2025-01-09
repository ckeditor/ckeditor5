/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentcommandbehavior/indentbehavior
 */

/**
 * Provides indentation behavior to {@link module:indent/indentblockcommand~IndentBlockCommand}.
 */
export interface IndentBehavior {

	/**
	 * The direction of indentation.
	 */
	isForward: boolean;

	/**
	 * Checks if the command should be enabled.
	 */
	checkEnabled: ( indentAttributeValue: string ) => boolean;

	/**
	 * Returns a new indent attribute value based on the current indent.
	 * This method returns `undefined` when the indentation should be removed.
	 */
	getNextIndent: ( indentAttributeValue: string ) => string | undefined;
}
