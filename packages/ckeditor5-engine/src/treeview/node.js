/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../ckeditorerror.js';
import EmitterMixin from '../emittermixin.js';
import objectUtils from '../lib/lodash/object.js';

/**
 * Abstract tree view node class.
 *
 * @abstract
 * @class treeView.Node
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 *
	 * @constructor
	 */
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link treeView.Element#insertChildren}.
		 *
		 * @readonly
		 * @property {treeView.Element|null} parent
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
	 * Index of the node in the parent element or null if the node has no parent.
	 *
	 * Throws error if the parent element does not contain this node.
	 *
	 * @returns {Number|Null} Index of the node in the parent element or null if the node has not parent.
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
	 * @returns {treeView.Node|null} Nodes next sibling or `null` if it is the last child.
	 */
	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Returns nodes previous sibling or `null` if it is the first child.
	 *
	 * @returns {treeView.Node|null} Nodes previous sibling or `null` if it is the first child.
	 */
	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Get {@link treeView.TreeView} reference. If the node has {@link treeView.TreeView}, assign by
	 * {@link treeView.Node#setTreeView} it will be returned. Otherwise {@link treeView.TreeView} of the parents node
	 * will be returned. If node has no parent, `null` will be returned.
	 *
	 * @returns {treeView.TreeView|Null} Tree view of the node, tree view of the parent or null.
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
	 * Set the {@link treeView.TreeView} of the node. Note that not all of nodes need to have {@link treeView.TreeView}
	 * assigned, see {@link treeView.Node#getTreeView}.
	 *
	 * @param {treeView.TreeView} treeView Tree view.
	 */
	setTreeView( treeView ) {
		this._treeView = treeView;
	}

	/**
	 * Fire {@link treeView.Node#change change event}.
	 *
	 * @param {treeView.ChangeType} type Type of the change.
	 * @param {treeView.Node} node Changed node.
	 */
	_fireChange( type, node ) {
		this.fire( 'change', type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}

	/**
	 * Fired when node changes. In case of {@link treeView.Text text nodes} in will be change of the text. In case of
	 * {@link treeView.Element elements} in will be change of child nodes or attributes.
	 *
	 * @event change
	 *
	 * @param {treeView.ChangeType} Type of the change.
	 * @param {treeView.Node} Changed node.
	 */
}

objectUtils.extend( Node.prototype, EmitterMixin );

