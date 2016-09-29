/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getAncestors from './getancestors.js';

/**
 * Searches and returns the lowest common ancestor of two given nodes.
 *
 * @param {Node} nodeA First node.
 * @param {Node} nodeB Second node.
 * @returns {Node|null} Lowest common ancestor of both nodes or `null` if nodes do not have a common ancestor.
 */
export default function getCommonAncestor( nodeA, nodeB ) {
	if ( nodeA == nodeB ) {
		return nodeA;
	}

	const ancestorsA = getAncestors( nodeA );
	const ancestorsB = getAncestors( nodeB );

	const minLength = Math.min( ancestorsA.length, ancestorsB.length );

	for ( let i = minLength - 1; i >= 0; i-- ) {
		if ( ancestorsA[ i ] == ancestorsB[ i ] ) {
			return ancestorsA[ i ];
		}
	}

	return null;
}
