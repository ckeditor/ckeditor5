/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isrange
 */

/**
 * Checks if the object is a native DOM Range.
 */
export default function isRange( obj: unknown ): obj is Range {
	return Object.prototype.toString.apply( obj ) == '[object Range]';
}
