/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/first
 */

/**
 * Returns first item of the given `iterable`.
 *
 * @param {Iterable.<*>} iterable
 * @returns {*}
 */
export default function first( iterable ) {
	const iteratorItem = iterable.next();

	if ( iteratorItem.done ) {
		return null;
	}

	return iteratorItem.value;
}
