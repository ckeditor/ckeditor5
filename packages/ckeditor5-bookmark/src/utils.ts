/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/utils
 */

/**
 * Returns `true` if the bookmark id is valid; otherwise, returns `false`.
 */
export function isBookmarkIdValid( id: string ): boolean {
	if ( !id || typeof id !== 'string' ) {
		return false;
	}

	if ( /\s/.test( id ) ) {
		return false;
	}

	return true;
}
