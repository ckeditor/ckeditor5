/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEditorError from '../../utils/ckeditorerror.js';
import EmitterMixin from '../../utils/emittermixin.js';
import mix from '../../utils/mix.js';

/**
 * Abstract tree view node class.
 *
 * @abstract
 * @memberOf engine.treeView
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 */
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link engine.treeView.Element#insertChildren}.
		 *
		 * @readonly
		 * @member {engine.treeView.Element|engine.treeView.DocumentFragment|null} engine.treeView.Node#parent
		 */
		this.parent = null;

		/**
		 * {@link engine.treeView.Document} reference.
		 *
		 * @protected
		 * @member {engine.treeView.Document} engine.treeView.Node#_document
		 */
		this._document = null;
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
	 * @returns {engine.treeView.Node|null} Nodes next sibling or `null` if it is the last child.
	 */
	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Returns nodes previous sibling or `null` if it is the first child.
	 *
	 * @returns {engine.treeView.Node|null} Nodes previous sibling or `null` if it is the first child.
	 */
	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Gets {@link engine.treeView.Document} reference. If the node has {@link engine.treeView.Document}, assign by
	 * {@link engine.treeView.Node#setDocument} it will be returned. Otherwise {@link engine.treeView.Document} of the parents node
	 * will be returned. If node has no parent, `null` will be returned.
	 *
	 * @returns {engine.treeView.Document|null} Tree view of the node, tree view of the parent or null.
	 */
	getDocument() {
		if ( this._document ) {
			return this._document;
		} else if ( this.parent ) {
			return this.parent.getDocument();
		} else {
			return null;
		}
	}

	/**
	 * Returns ancestors array of this node.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeNode=false] When set to `true` this node will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from node's parent to root element,
	 * otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeNode: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeNode ? this : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}

	/**
	 * Sets the {@link engine.treeView.Document} of the node. Note that not all of nodes need to have {@link engine.treeView.Document}
	 * assigned, see {@link engine.treeView.Node#getDocument}.
	 *
	 * @param {engine.treeView.Document} document Document.
	 */
	setDocument( document ) {
		this._document = document;
	}

	/**
	 * Removes node from parent.
	 */
	remove() {
		this.parent.removeChildren( this.getIndex() );
	}

	/**
	 * @param {engine.treeView.ChangeType} type Type of the change.
	 * @param {engine.treeView.Node} node Changed node.
	 * @fires engine.treeView.Node#change
	 */
	_fireChange( type, node ) {
		this.fire( 'change', type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}

	/**
	 * Clones this node.
	 *
	 * @method treeView.Node#clone
	 * @returns {treeView.Node} Clone of this node.
	 */

	/**
	 * Checks if provided node is similar to this node.
	 *
	 * @method treeView.Node#isSimilar
	 * @returns {Boolean} True if nodes are similar.
	 */

	/**
	 * Fired when a node changes.
	 *
	 * * In case of {@link engine.treeView.Text text nodes} it will be a change of the text data.
	 * * In case of {@link engine.treeView.Element elements} it will be a change of child nodes or attributes.
	 *
	 * Change event is bubbling, it is fired on the ancestors chain.
	 *
	 * @event engine.treeView.Node#change
	 * @param {engine.treeView.ChangeType} Type of the change.
	 * @param {engine.treeView.Node} Changed node.
	 */
}

mix( Node, EmitterMixin );
