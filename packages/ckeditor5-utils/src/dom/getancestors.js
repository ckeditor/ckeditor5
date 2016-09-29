/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Returns all ancestors of given DOM node, starting from the top-most (root). Includes the given node itself.
 *
 * @param {Element|Text} node DOM node.
 * @returns {Array.<Node>} Array of given `node` parents.
 */
export default function getAncestors( node ) {
	const nodes = [];

	while ( node ) {
		nodes.unshift( node );
		node = node.parentNode;
	}

	return nodes;
}
