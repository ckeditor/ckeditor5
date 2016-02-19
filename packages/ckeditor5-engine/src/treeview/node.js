/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';
import EmitterMixin from '../emittermixin.js';
import utils from '../utils.js';

/**
 * Creates a tree view node.
 *
 * This is an abstract class, so this constructor should not be used directly.
 *
 * @abstract
 * @class core.treeView.Node
 * @classdesc Abstract tree view node class.
 */
export default class Node {
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link treeView.Element#insertChildren}.
		 *
		 * @readonly
		 * @type {treeView.Element|null}
		 */
		this.parent = null;

		/**
		 * {@link treeView.TreeView} reference.
		 *
		 * @protected
		 * @type {treeView.TreeView}
		 */
		this._treeView = null;
	}

	/**
	 * Returns index of the node in the parent element or null if the node has no parent.
	 *
	 * Throws error if the parent element does not contain this node.
	 *
	 * @method core.treeView.Node#getIndex
	 * @returns {Number|null} Index of the node in the parent element or null if the node has not parent.
	 */
	getIndex() {
		let pos;

		if ( !this.parent ) {
			return null;
		}

		// No parent or child doesn't exist in parent's children.
		if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
			/**
			 * The node's parent does not contain this node. It means that the document tree is corrupted.
			 *
			 * @error treeview-node-not-found-in-parent
			 */
			throw new CKEditorError( 'treeview-node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	/**
	 * Returns nodes next sibling or `null` if it is the last child.
	 *
	 * @method core.treeView.Node#getNextSibling
	 * @returns {treeView.Node|null} Nodes next sibling or `null` if it is the last child.
	 */
	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Returns nodes previous sibling or `null` if it is the first child.
	 *
	 * @method core.treeView.Node#getPreviousSibling
	 * @returns {treeView.Node|null} Nodes previous sibling or `null` if it is the first child.
	 */
	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Gets {@link treeView.TreeView} reference. If the node has {@link treeView.TreeView}, assign by
	 * {@link treeView.Node#setTreeView} it will be returned. Otherwise {@link treeView.TreeView} of the parents node
	 * will be returned. If node has no parent, `null` will be returned.
	 *
	 * @method core.treeView.Node#getTreeView
	 * @returns {treeView.TreeView|null} Tree view of the node, tree view of the parent or null.
	 */
	getTreeView() {
		if ( this._treeView ) {
			return this._treeView;
		} else if ( this.parent ) {
			return this.parent.getTreeView();
		} else {
			return null;
		}
	}

	/**
	 * Sets the {@link treeView.TreeView} of the node. Note that not all of nodes need to have {@link treeView.TreeView}
	 * assigned, see {@link treeView.Node#getTreeView}.
	 *
	 * @method core.treeView.Node#setTreeView
	 * @param {treeView.TreeView} treeView Tree view.
	 */
	setTreeView( treeView ) {
		this._treeView = treeView;
	}

	/**
	 * @method core.treeView.Node#_fireChange
	 * @param {treeView.ChangeType} type Type of the change.
	 * @param {treeView.Node} node Changed node.
	 * @fires {@link core.treeView.Node#change change event}.
	 */
	_fireChange( type, node ) {
		this.fire( 'change', type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}

	/**
	 * Fired when a node changes.
	 *
	 * * In case of {@link treeView.Text text nodes} it will be a change of the text data.
	 * * In case of {@link treeView.Element elements} it will be a change of child nodes or attributes.
	 *
	 * Change event is bubbling, it is fired on the ancestors chain.
	 *
	 * @event core.treeView.Node#change
	 * @param {treeView.ChangeType} Type of the change.
	 * @param {treeView.Node} Changed node.
	 */
}

utils.mix( Node, EmitterMixin );
