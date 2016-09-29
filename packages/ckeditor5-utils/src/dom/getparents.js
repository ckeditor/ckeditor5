/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Returns all parents of given DOM node, starting from the top-most (root). Includes the node itself.
 *
 * @param {Node} node DOM node.
 * @returns {Array.<Node>} Array of given `node` parents.
 */
export default function getParents( node ) {
	const nodes = [];

	while ( node ) {
		nodes.unshift( node );
		node = node.parentNode;
	}

	return nodes;
}
