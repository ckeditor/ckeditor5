/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getParents from './getparents.js';

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

	const parentsA = getParents( nodeA );
	const parentsB = getParents( nodeB );

	const minLength = Math.min( parentsA.length, parentsB.length );

	for ( let i = minLength - 1; i >= 0; i-- ) {
		if ( parentsA[ i ] == parentsB[ i ] ) {
			return parentsA[ i ];
		}
	}

	return null;
}
