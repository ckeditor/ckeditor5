/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import NodeList from './nodelist.js';

/**
 * DocumentFragment represents a part of Tree Model which does not have a common root but it's top level nodes
 * can be seen as siblings.
 *
 * @memberOf engine.model
 */
export default class DocumentFragment {
	/**
	 * Creates empty DocumentFragment.
	 *
	 * @param {engine.model.NodeSet} children List of nodes contained inside the DocumentFragment.
	 */
	constructor( children ) {
		/**
		 * List of nodes contained inside the DocumentFragment.
		 *
		 * @protected
		 * @member {engine.model.NodeSet} engine.model.DocumentFragment#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * `DocumentFragment` iterator. Returns {@link engine.model.Node nodes} that are added to the `DocumentFragment`.
	 */
	[ Symbol.iterator ]() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * The root of `DocumentFragment`. Returns itself. Added for compatibility reasons with {@link engine.model.Element}.
	 *
	 * @readonly
	 * @type {engine.model.DocumentFragment}
	 */
	get root() {
		return this;
	}

	/**
	 * Returns path to the `DocumentFragment` This is always equal to empty array and is added for compatibility reasons
	 * with {@link engine.model.Element}.
	 *
	 * @returns {Array} The path.
	 */
	getPath() {
		return [];
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.model.Node} Child node.
	 */
	getChild( index ) {
		return this._children.get( index );
	}

	/**
	 * Gets the number of top-level elements of DocumentFragment.
	 *
	 * @returns {Number} The number of top-level elements.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node.
	 *
	 * @param {engine.model.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Inserts a child node or a list of child nodes at the end of this DocumentFragment.
	 *
	 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Inserts a list of child nodes on the given index and sets the parent of these nodes to this DocumentFragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		let nodeList = new NodeList( nodes );

		for ( let node of nodeList._nodes ) {
			node.parent = this;
		}

		// Clean original DocumentFragment so it won't contain nodes that were added somewhere else.
		if ( nodes instanceof DocumentFragment ) {
			nodes._children = new NodeList();
		}

		this._children.insert( index, nodeList );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Position of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {engine.model.NodeList} The list of removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		let nodeList = this._children.remove( index, howMany );

		for ( let node of nodeList._nodes ) {
			node.parent = null;
		}

		return nodeList;
	}
}
