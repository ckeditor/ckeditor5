/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import NodeList from './nodelist.js';

/**
 * DocumentFragment represents a part of Tree Model which does not have a common root but it's top level nodes
 * can be seen as siblings.
 *
 * @memberOf engine.treeModel
 */
export default class DocumentFragment {
	/**
	 * Creates empty DocumentFragment.
	 *
	 * @protected
	 * @param {engine.treeModel.NodeSet} children List of nodes contained inside the DocumentFragment.
	 */
	constructor( children ) {
		/**
		 * List of nodes contained inside the DocumentFragment.
		 *
		 * @protected
		 * @member {engine.treeModel.NodeSet} engine.treeModel.DocumentFragment#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.treeModel.Node} Child node.
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
	 * @param {engine.treeModel.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Inserts a child node or a list of child nodes at the end of this DocumentFragment.
	 *
	 * @param {engine.treeModel.NodeSet} nodes The list of nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Inserts a list of child nodes on the given index and sets the parent of these nodes to this DocumentFragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {engine.treeModel.NodeSet} nodes The list of nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		let nodeList = new NodeList( nodes );

		for ( let node of nodeList._nodes ) {
			node.parent = this;
		}

		this._children.insert( index, nodeList );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Position of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {engine.treeModel.NodeList} The list of removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		let nodeList = this._children.remove( index, howMany );

		for ( let node of nodeList._nodes ) {
			node.parent = null;
		}

		return nodeList;
	}
}
