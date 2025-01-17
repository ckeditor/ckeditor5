/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/first
 */

/**
 * Returns first item of the given `iterator`.
 */
export default function first<T>( iterator: Iterator<T> ): T | null {
	const iteratorItem = iterator.next();

	if ( iteratorItem.done ) {
		return null;
	}

	return iteratorItem.value;
}
