/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Node */

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
	return obj && obj.nodeType === Node.COMMENT_NODE;
}
