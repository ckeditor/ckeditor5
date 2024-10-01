/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/utils
 */

/**
 * Returns `true` if bookmark id is valid otherwise its `false`.
 */
export function isBookmarkIdValid( id: string ): boolean {
	if ( !id || typeof id !== 'string' ) {
		return false;
	}

	if ( id.replace( /\s+/g, '' ).length === 0 ) {
		return false;
	}

	if ( id.split( ' ' ).length > 1 ) {
		return false;
	}

	return true;
}
