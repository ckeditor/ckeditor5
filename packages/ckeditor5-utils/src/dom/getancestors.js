/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Node */

/**
 * @module utils/dom/getancestors
 */

/**
 * Returns all ancestors of given DOM node, starting from the top-most (root). Includes the given node itself. If the
 * node is a part of `DocumentFragment` that `DocumentFragment` will be returned. In contrary, if the node is
 * appended to a `Document`, that `Document` will not be returned (algorithms operating on DOM tree care for `Document#documentElement`
 * at most, which will be returned).
 *
 * @param {Node} node DOM node.
 * @returns {Array.<Node|DocumentFragment>} Array of given `node` parents.
 */
export default function getAncestors( node ) {
	const nodes = [];

	// We are interested in `Node`s `DocumentFragment`s only.
	while ( node && node.nodeType != Node.DOCUMENT_NODE ) {
		nodes.unshift( node );
		node = node.parentNode;
	}

	return nodes;
}
