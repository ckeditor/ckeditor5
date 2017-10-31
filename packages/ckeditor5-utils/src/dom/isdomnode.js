/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/isdomnode
 */

import isNative from '../lib/lodash/isNative';

/**
 * Checks if the object is a native DOM Node.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isDomNode( obj ) {
	return !!( obj && isNative( obj.addEventListener ) );
}
