/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import clone from '../lib/lodash/clone.js';
import utils from '../utils.js';
import CKEditorError from '../ckeditorerror.js';

/**
 * Creates a tree node.
 *
 * This is an abstract class, so this constructor should not be used directly.
 *
 * @param {Iterable|Object} attrs Iterable collection of attributes.
 *
 * @abstract
 * @class core.treeModel.Node
 * @classdesc Abstract document tree node class.
 */
export default class Node {
	constructor( attrs ) {
		/**
		 * Parent element. Null by default. Set by {@link core.treeModel.Element#insertChildren}.
		 *
		 * @member core.treeModel.Node#parent
		 * @readonly
		 * @member {core.treeModel.Element|null} core.treeModel.Node#parent
		 */
		this.parent = null;

		/**
		 * List of attributes set on this node.
		 *
		 * **Note:** It is **important** that attributes of nodes already attached to the document must be changed
		 * only by an {@link core.treeModel.operation.AttributeOperation}. Do not set attributes of such nodes
		 * using {@link core.treeModel.Node} methods.
		 *
		 * @protected
		 * @member {Map} core.treeModel.Node#_attrs
		 */
		this._attrs = utils.toMap( attrs );
	}

	/**
	 * Depth of the node, which equals to total number of its parents.
	 *
	 * @readonly
	 * @member {Number} core.treeModel.Node#depth
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
	 * @member {core.treeModel.Node|null} core.treeModel.Node#nextSibling
	 */
	get nextSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index + 1 ) ) || null;
	}

	/**
	 * Nodes previous sibling or null if it is the last child.
	 *
	 * @readonly
	 * @member {core.treeModel.Node|null} core.treeModel.Node#previousSibling
	 */
	get previousSibling() {
		const index = this.getIndex();

		return ( index !== null && this.parent.getChild( index - 1 ) ) || null;
	}

	/**
	 * The top parent for the node. If node has no parent it is the root itself.
	 *
	 * @readonly
	 * @member {Number} core.treeModel.Node#root
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
	 * @method core.treeModel.Node#getIndes
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
	 * will be `[ 1, 2 ]`. This path can be used as a parameter of {@link core.treeModel.Position}.
	 *
	 * @method core.treeModel.Node#getPath
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
	 * @method core.treeModel.Node#toJSON
	 * @returns {Object} Clone of this object with the parent property replaced with its name.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json.parent = this.parent ? this.parent.name : null;

		return json;
	}

	/**
	 * Checks if the node has an attribute for given key.
	 *
	 * @method core.treeModel.Node#hasAttribute
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on node, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Gets an attribute value for given key or undefined if that attribute is not set on node.
	 *
	 * @method core.treeModel.Node#getAttribute
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or null.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterator that iterates over this node attributes.
	 *
	 * @method core.treeModel.Node#getAttributes
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs[ Symbol.iterator ]();
	}
}
