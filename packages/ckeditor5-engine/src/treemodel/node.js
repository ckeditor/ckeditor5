/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import AttributeList from './attributelist.js';
import langUtils from '../lib/lodash/lang.js';
import CKEditorError from '../ckeditorerror';

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
	 * @param {Iterable} attrs Iterable collection of {@link treeModel.Attribute attributes}.
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
		 * Attributes of nodes attached to the document can be changed only be the {@link treeModel.operation.AttributeOperation}.
		 *
		 * @private
		 * @property {treeModel.AttributeList} _attrs
		 */
		this._attrs = new AttributeList( attrs );
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
	 * @see {@link treeModel.AttributeList#getAttr}
	 */
	getAttr( key ) {
		return this._attrs.getAttr( key );
	}

	/**
	 * @see {@link treeModel.AttributeList#getAttrs}
	 */
	getAttrs() {
		return this._attrs.getAttrs();
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
	 * @see {@link treeModel.AttributeList#hasAttr}
	 */
	hasAttr( key ) {
		return this._attrs.hasAttr( key );
	}

	/**
	 * @see {@link treeModel.AttributeList#removeAttr}
	 */
	removeAttr( key ) {
		this._attrs.removeAttr( key );
	}

	/**
	 * @see {@link treeModel.AttributeList#setAttr}
	 */
	setAttr( attr ) {
		this._attrs.setAttr( attr );
	}

	/**
	 * @see {@link treeModel.AttributeList#setAttrsTo}
	 */
	setAttrsTo( attrs ) {
		this._attrs.setAttrsTo( attrs );
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
}