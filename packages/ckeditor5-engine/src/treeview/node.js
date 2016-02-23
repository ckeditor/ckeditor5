/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';
import EmitterMixin from '../emittermixin.js';
import utils from '../utils.js';

/**
 * Abstract tree view node class.
 *
 * @abstract
 * @memberOf core.treeView
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 */
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link core.treeView.Element#insertChildren}.
		 *
		 * @readonly
		 * @member {core.treeView.Element|null} core.treeView.Node#parent
		 */
		this.parent = null;

		/**
		 * {@link core.treeView.TreeView} reference.
		 *
		 * @protected
		 * @member {core.treeView.TreeView} core.treeView.Node#_treeView
		 */
		this._treeView = null;
	}

	/**
	 * Returns index of the node in the parent element or null if the node has no parent.
	 *
	 * Throws error if the parent element does not contain this node.
	 *
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
	 * @returns {core.treeView.Node|null} Nodes next sibling or `null` if it is the last child.
	 */
	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Returns nodes previous sibling or `null` if it is the first child.
	 *
	 * @returns {core.treeView.Node|null} Nodes previous sibling or `null` if it is the first child.
	 */
	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Gets {@link core.treeView.TreeView} reference. If the node has {@link core.treeView.TreeView}, assign by
	 * {@link core.treeView.Node#setTreeView} it will be returned. Otherwise {@link core.treeView.TreeView} of the parents node
	 * will be returned. If node has no parent, `null` will be returned.
	 *
	 * @returns {core.treeView.TreeView|null} Tree view of the node, tree view of the parent or null.
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
	 * Sets the {@link core.treeView.TreeView} of the node. Note that not all of nodes need to have {@link core.treeView.TreeView}
	 * assigned, see {@link core.treeView.Node#getTreeView}.
	 *
	 * @param {core.treeView.TreeView} treeView Tree view.
	 */
	setTreeView( treeView ) {
		this._treeView = treeView;
	}

	/**
	 * @param {core.treeView.ChangeType} type Type of the change.
	 * @param {core.treeView.Node} node Changed node.
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
	 * * In case of {@link core.treeView.Text text nodes} it will be a change of the text data.
	 * * In case of {@link core.treeView.Element elements} it will be a change of child nodes or attributes.
	 *
	 * Change event is bubbling, it is fired on the ancestors chain.
	 *
	 * @event core.treeView.Node#change
	 * @param {core.treeView.ChangeType} Type of the change.
	 * @param {core.treeView.Node} Changed node.
	 */
}

utils.mix( Node, EmitterMixin );
