/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/isiterable
 */

/**
 * Checks if value implements iterator interface.
 *
 * @param value The value to check.
 * @returns True if value implements iterator interface.
 */
export default function isIterable( value: any ): value is Iterable<any> {
	return !!( value && value[ Symbol.iterator ] );
}
