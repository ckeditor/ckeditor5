/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '../../utils/utils.js';

/**
 * DocumentFragment class.
 *
 * @memberOf engine.treeView
 */
export default class DocumentFragment {
	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @param {engine.treeView.Node|Iterable.<engine.treeView.Node>} [children] List of nodes to be inserted into created element.
	 */
	constructor( children ) {
		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<engine.treeView.DocumentFragment>} engine.treeView.Element#_children
		 */
		this._children = [];

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * {@link engine.treeView.DocumentFragment#insertChildren Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @fires engine.treeView.Node#change
	 * @param {engine.treeView.Node|Iterable.<engine.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @returns {Number} Number of appended nodes.
	 */
	appendChildren( nodes ) {
		return this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.treeView.Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
	}

	/**
	 * Gets the number of elements in fragment.
	 *
	 * @returns {Number} The number of elements.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {engine.treeView.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<engine.treeView.Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this fragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {engine.treeView.Node|Iterable.<engine.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChildren( index, nodes ) {
		let count = 0;

		if ( !utils.isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<engine.treeView.Node>} The array of removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		for ( let i = index; i < index + howMany; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, howMany );
	}
}