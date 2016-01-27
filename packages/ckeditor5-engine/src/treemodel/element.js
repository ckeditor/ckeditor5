/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import NodeList from './nodelist.js';
import utils from '../utils.js';

/**
 * Tree data model element.
 *
 * @class treeModel.Element
 */
export default class Element extends Node {
	/**
	 * Creates a tree data model element.
	 *
	 * @param {String} name Node name.
	 * @param {Iterable} attrs Iterable collection of attributes.
	 * @param {treeModel.NodesSet} children List of nodes to be inserted
	 * into created element. List of nodes can be of any type accepted by the {@link treeModel.NodeList} constructor.
	 * @constructor
	 */
	constructor( name, attrs, children ) {
		super( attrs );

		/**
		 * Element name.
		 *
		 * @readonly
		 * @property {String} name
		 */
		this.name = name;

		/**
		 * List of children nodes.
		 *
		 * @protected
		 * @property {treeModel.NodeList} _children
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
	 * @returns {treeModel.Node} Child node.
	 */
	getChild( index ) {
		return this._children.get( index );
	}

	/**
	 * Gets the number of element's children.
	 *
	 * @returns {Number} The number of element's children.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node.
	 *
	 * @param {treeModel.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Inserts a list of child nodes on the given index and sets the parent of these nodes to this element.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link treeModel.operation.InsertOperation}.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {treeModel.NodesSet} nodes The list of nodes to be inserted.
	 * The list of nodes can be of any type accepted by the {@link treeModel.NodeList} constructor.
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
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link treeModel.operation.RemoveOperation}.
	 *
	 * @param {Number} index Position of the first node to remove.
	 * @param {Number} number Number of nodes to remove.
	 * @returns {treeModel.NodeList} The list of removed nodes.
	 */
	removeChildren( index, number ) {
		let nodeList = this._children.remove( index, number );

		for ( let node of nodeList._nodes ) {
			node.parent = null;
		}

		return nodeList;
	}

	/**
	 * Sets attribute on the element. If attribute with the same key already is set, it overwrites its values.
	 *
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the element and sets given attributes.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set. See {@link treeModel.Node#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		this._attrs = utils.toMap( attrs );
	}

	/**
	 * Removes an attribute with given key from the element.
	 *
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute was set on the element, `false` otherwise.
	 */
	removeAttribute( key ) {
		return this._attrs.delete( key );
	}

	/**
	 * Removes all attributes from the element.
	 */
	clearAttributes() {
		this._attrs.clear();
	}
}
