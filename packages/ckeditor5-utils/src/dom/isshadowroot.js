/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global ShadowRoot */

/**
 * @module utils/dom/isshadowroot
 */

/**
 * Checks if the object is a `ShadowRoot`.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isShadowRoot( obj ) {
	return obj instanceof ShadowRoot;
}
