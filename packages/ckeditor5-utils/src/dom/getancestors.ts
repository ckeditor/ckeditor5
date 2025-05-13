/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getancestors
 */

/**
 * Returns all ancestors of given DOM node, starting from the top-most (root). Includes the given node itself. If the
 * node is a part of `DocumentFragment` that `DocumentFragment` will be returned. In contrary, if the node is
 * appended to a `Document`, that `Document` will not be returned (algorithms operating on DOM tree care for `Document#documentElement`
 * at most, which will be returned).
 *
 * @param node DOM node.
 * @returns Array of given `node` parents.
 */
export default function getAncestors( node: Node ): Array<Node> {
	const nodes: Array<Node> = [];
	let currentNode: Node | null = node;

	// We are interested in `Node`s `DocumentFragment`s only.
	while ( currentNode && currentNode.nodeType != Node.DOCUMENT_NODE ) {
		nodes.unshift( currentNode );
		currentNode = currentNode.parentNode;
	}

	return nodes;
}
