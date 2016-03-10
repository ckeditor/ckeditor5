/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import NodeList from './nodelist.js';
import utils from '../../utils/utils.js';

/**
 * Tree data model element.
 *
 * @memberOf core.treeModel
 */
export default class Element extends Node {
	/**
	 * Creates a tree data model element.
	 *
	 * @param {String} name Node name.
	 * @param {Iterable} attrs Iterable collection of attributes.
	 * @param {core.treeModel.NodeSet} children List of nodes to be inserted
	 * into created element. List of nodes can be of any type accepted by the {@link core.treeModel.NodeList} constructor.
	 */
	constructor( name, attrs, children ) {
		super( attrs );

		/**
		 * Element name.
		 *
		 * @readonly
		 * @type {String}
		 */
		this.name = name;

		/**
		 * List of children nodes.
		 *
		 * @protected
		 * @type {core.treeModel.NodeList}
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Gets child at the given index.
	 *
	 * @method core.treeModel.Element#getChild
	 * @param {Number} index Index of child.
	 * @returns {core.treeModel.Node} Child node.
	 */
	getChild( index ) {
		return this._children.get( index );
	}

	/**
	 * Gets the number of element's children.
	 *
	 * @method core.treeModel.Element#getChildCount
	 * @returns {Number} The number of element's children.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node.
	 *
	 * @method core.treeModel.Element#getChildIndex
	 * @param {core.treeModel.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * {@link core.treeModel.Element#insert Inserts} a child node or a list of child nodes at the end of this node and sets
	 * the parent of these nodes to this element.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link core.treeModel.operation.InsertOperation}.
	 *
	 * @method core.treeModel.Element#appendChildren
	 * @param {core.treeModel.NodeSet} nodes The list of nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Inserts a list of child nodes on the given index and sets the parent of these nodes to this element.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link core.treeModel.operation.InsertOperation}.
	 *
	 * @method core.treeModel.Element#insertChildren
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {core.treeModel.NodeSet} nodes The list of nodes to be inserted.
	 * The list of nodes can be of any type accepted by the {@link core.treeModel.NodeList} constructor.
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
	 * All attached nodes should be modified using the {@link core.treeModel.operation.RemoveOperation}.
	 *
	 * @method core.treeModel.Element#removeChildren
	 * @param {Number} index Position of the first node to remove.
	 * @param {Number} [number] Number of nodes to remove.
	 * @returns {core.treeModel.NodeList} The list of removed nodes.
	 */
	removeChildren( index, number ) {
		if ( typeof number === 'undefined' ) {
			number = 1;
		}

		let nodeList = this._children.remove( index, number );

		for ( let node of nodeList._nodes ) {
			node.parent = null;
		}

		return nodeList;
	}

	/**
	 * Sets attribute on the element. If attribute with the same key already is set, it overwrites its values.
	 *
	 * @method core.treeModel.Element#setAttribute
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );
	}

	/**
	 * Removes all attributes from the element and sets given attributes.
	 *
	 * @method core.treeModel.Element#setAttributesTo
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set. See {@link core.treeModel.Node#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		this._attrs = utils.toMap( attrs );
	}

	/**
	 * Removes an attribute with given key from the element.
	 *
	 * @method core.treeModel.Element#removeAttribute
	 * @param {String} key Key of attribute to remove.
	 * @returns {Boolean} `true` if the attribute was set on the element, `false` otherwise.
	 */
	removeAttribute( key ) {
		return this._attrs.delete( key );
	}

	/**
	 * Removes all attributes from the element.
	 *
	 * @method core.treeModel.Element#clearAttributes
	 */
	clearAttributes() {
		this._attrs.clear();
	}
}
