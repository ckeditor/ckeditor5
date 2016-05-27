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
 * @memberOf engine.view
 */
export default class Node {
	/**
	 * Creates a tree view node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 */
	constructor() {
		/**
		 * Parent element. Null by default. Set by {@link engine.view.Element#insertChildren}.
		 *
		 * @readonly
		 * @member {engine.view.Element|engine.view.DocumentFragment|null} engine.view.Node#parent
		 */
		this.parent = null;
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
			 * @error view-node-not-found-in-parent
			 */
			throw new CKEditorError( 'view-node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	/**
	 * Returns nodes next sibling or `null` if it is the last child.
	 *
	 * @returns {engine.view.Node|null} Nodes next sibling or `null` if it is the last child.
	 */
	getNextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Returns nodes previous sibling or `null` if it is the first child.
	 *
	 * @returns {engine.view.Node|null} Nodes previous sibling or `null` if it is the first child.
	 */
	getPreviousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * Gets {@link engine.view.Document} reference, from the {@link engine.view.Node#getRoot root} or
	 * returns null if the root has no reference to the {@link engine.view.Document}.
	 *
	 * @returns {engine.view.Document|null} View Document of the node or null.
	 */
	getDocument() {
		if ( this.parent ) {
			return this.parent.getDocument();
		} else {
			return null;
		}
	}

	/**
	 * Gets the top parent for the node. If node has no parent it is the root itself.
	 *
	 * @returns {engine.view.Node}
	 */
	getRoot() {
		let root = this;

		while ( root.parent ) {
			root = root.parent;
		}

		return root;
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
	 * Removes node from parent.
	 */
	remove() {
		this.parent.removeChildren( this.getIndex() );
	}

	/**
	 * @param {engine.view.ChangeType} type Type of the change.
	 * @param {engine.view.Node} node Changed node.
	 * @fires engine.view.Node#change
	 */
	_fireChange( type, node ) {
		this.fire( 'change:' + type, node );

		if ( this.parent ) {
			this.parent._fireChange( type, node );
		}
	}

	/**
	 * Clones this node.
	 *
	 * @method view.Node#clone
	 * @returns {view.Node} Clone of this node.
	 */

	/**
	 * Checks if provided node is similar to this node.
	 *
	 * @method view.Node#isSimilar
	 * @returns {Boolean} True if nodes are similar.
	 */

	/**
	 * Fired when list of {@link engine.view.Element elements} children changes.
	 *
	 * Change event is bubbled – it is fired on all ancestors.
	 *
	 * @event engine.view.Node#change:children
	 * @param {engine.view.Node} Changed node.
	 */

	/**
	 * Fired when list of {@link engine.view.Element elements} attributes changes.
	 *
	 * Change event is bubbled – it is fired on all ancestors.
	 *
	 * @event engine.view.Node#change:attributes
	 * @param {engine.view.Node} Changed node.
	 */

	/**
	 * Fired when {@link engine.view.Text text nodes} data changes.
	 *
	 * Change event is bubbled – it is fired on all ancestors.
	 *
	 * @event engine.view.Node#change:text
	 * @param {engine.view.Node} Changed node.
	 */
}

mix( Node, EmitterMixin );
