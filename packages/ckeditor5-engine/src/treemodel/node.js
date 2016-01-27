/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import langUtils from '../lib/lodash/lang.js';
import utils from '../utils.js';
import CKEditorError from '../ckeditorerror.js';

/**
 * Abstract document tree node class.
 *
 * @abstract
 * @class treeModel.Node
 */
export default class Node {
	/**
	 * Creates a tree node.
	 *
	 * This is an abstract class, so this constructor should not be used directly.
	 *
	 * @param {Iterable} attrs Iterable collection of attributes.
	 * @constructor
	 */
	constructor( attrs ) {
		/**
		 * Parent element. Null by default. Set by {@link treeModel.Element#insertChildren}.
		 *
		 * @readonly
		 * @property {treeModel.Element|null} parent
		 */
		this.parent = null;

		/**
		 * List of attributes set on this node.
		 * **Note:** It is **important** that attributes of nodes already attached to the document must be changed
		 * only by an {@link treeModel.operation.AttributeOperation}. Do not set attributes of such nodes
		 * using {@link treeModel.Node} methods.
		 *
		 * @protected
		 * @property {Map} _attrs
		 */
		if ( langUtils.isPlainObject( attrs ) ) {
			this._attrs = utils.objectToMap( attrs );
		} else {
			this._attrs = new Map( attrs );
		}
	}

	/**
	 * Depth of the node, which equals to total number of its parents.
	 *
	 * @readonly
	 * @property {Number} depth
	 */
	get depth() {
		let depth = 0;
		let parent = this.parent;

		while ( parent ) {
			depth++;

			parent = parent.parent;
		}

		return depth;
	}

	/**
	 * Nodes next sibling or `null` if it is the last child.
	 *
	 * @readonly
	 * @property {treeModel.Node|null} nextSibling
	 */
	get nextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Nodes previous sibling or null if it is the last child.
	 *
	 * @readonly
	 * @property {treeModel.Node|null} previousSibling
	 */
	get previousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * The top parent for the node. If node has no parent it is the root itself.
	 *
	 * @readonly
	 * @property {Number} depth
	 */
	get root() {
		let root = this;

		while ( root.parent ) {
			root = root.parent;
		}

		return root;
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

		if ( ( pos = this.parent.getChildIndex( this ) ) == -1 ) {
			/**
			 * The node's parent does not contain this node.
			 *
			 * @error node-not-found-in-parent
			 */
			throw new CKEditorError( 'node-not-found-in-parent: The node\'s parent does not contain this node.' );
		}

		return pos;
	}

	/**
	 * Gets path to the node. For example if the node is the second child of the first child of the root then the path
	 * will be `[ 1, 2 ]`. This path can be used as a parameter of {@link treeModel.Position}.
	 *
	 * @returns {Number[]} The path.
	 */
	getPath() {
		const path = [];
		let node = this;

		while ( node.parent ) {
			path.unshift( node.getIndex() );
			node = node.parent;
		}

		return path;
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the parent property replaced with its name.
	 */
	toJSON() {
		const json = langUtils.clone( this );

		// Due to circular references we need to remove parent reference.
		json.parent = this.parent ? this.parent.name : null;

		return json;
	}

	/**
	 * Checks if the node has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on node, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Gets an attribute value for given key or undefined if that attribute is not set on node.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or null.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterator that iterates over this node attributes.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs[ Symbol.iterator ]();
	}
}
