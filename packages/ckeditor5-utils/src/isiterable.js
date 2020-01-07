/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/isiterable
 */

/**
 * Checks if value implements iterator interface.
 *
 * @param {*} value The value to check.
 * @returns {Boolean} True if value implements iterator interface.
 */
export default function isIterable( value ) {
	return !!( value && value[ Symbol.iterator ] );
}
