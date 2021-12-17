/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/iscomment
 */

/**
 * Checks if the object is a native DOM Comment node.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isComment( obj ) {
	return Object.prototype.toString.call( obj ) == '[object Comment]';
}
