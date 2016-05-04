/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Remove given node from parent.
 *
 * @param {Node} node Node to remove.
 */
export default function remove( node ) {
	const parent = node.parentNode;

	if ( parent ) {
		parent.removeChild( node );
	}
}