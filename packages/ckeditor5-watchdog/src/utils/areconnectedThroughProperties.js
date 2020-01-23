/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/utils/areconnectedthroughproperties
 */

import getSubNodes from './getsubnodes';

/**
 * Traverses both structures to find out whether there is a reference that is shared between both structures.
 *
 * @param {Object|Array} obj1
 * @param {Object|Array} obj2
 */
export default function areConnectedThroughProperties( obj1, obj2, excludedProperties = new Set() ) {
	if ( obj1 === obj2 && isObject( obj1 ) ) {
		return true;
	}

	const subNodes1 = getSubNodes( obj1, excludedProperties );
	const subNodes2 = getSubNodes( obj2, excludedProperties );

	for ( const node of subNodes1 ) {
		if ( subNodes2.has( node ) ) {
			return true;
		}
	}

	return false;
}

function isObject( structure ) {
	return typeof structure === 'object' && structure !== null;
}
