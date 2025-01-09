/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getcommonancestor
 */

import getAncestors from './getancestors.js';

/**
 * Searches and returns the lowest common ancestor of two given nodes.
 *
 * @param nodeA First node.
 * @param nodeB Second node.
 * @returns Lowest common ancestor of both nodes or `null` if nodes do not have a common ancestor.
 */
export default function getCommonAncestor( nodeA: Node, nodeB: Node ): Node | null {
	const ancestorsA = getAncestors( nodeA );
	const ancestorsB = getAncestors( nodeB );

	let i = 0;

	// It does not matter which array is shorter.
	while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
		i++;
	}

	return i === 0 ? null : ancestorsA[ i - 1 ];
}
