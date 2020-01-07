/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getcommonancestor
 */

import getAncestors from './getancestors';

/**
 * Searches and returns the lowest common ancestor of two given nodes.
 *
 * @param {Node} nodeA First node.
 * @param {Node} nodeB Second node.
 * @returns {Node|DocumentFragment|Document|null} Lowest common ancestor of both nodes or `null` if nodes do not have a common ancestor.
 */
export default function getCommonAncestor( nodeA, nodeB ) {
	const ancestorsA = getAncestors( nodeA );
	const ancestorsB = getAncestors( nodeB );

	let i = 0;

	// It does not matter which array is shorter.
	while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
		i++;
	}

	return i === 0 ? null : ancestorsA[ i - 1 ];
}
