/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/istext
 */

/**
 * Checks if the object is a native DOM Text node.
 */
export default function isText( obj: unknown ): obj is Text {
	return Object.prototype.toString.call( obj ) == '[object Text]';
}
