/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import NodeList from './nodelist.js';
import DocumentFragment from './documentfragment.js';
import Range from './range.js';
import toMap from '../../utils/tomap.js';

/**
 * Tree data model element.
 *
 * @memberOf engine.model
 */
export default class Element extends Node {
	/**
	 * Creates a tree data model element.
	 *
	 * @param {String} name Node name.
	 * @param {Iterable} [attrs] Iterable collection of attributes.
	 * @param {engine.model.NodeSet} [children] List of nodes to be inserted.
	 * into created element. List of nodes can be of any type accepted by the {@link engine.model.NodeList} constructor.
	 */
	constructor( name, attrs, children ) {
		super( attrs );

		/**
		 * Element name.
		 *
		 * @readonly
		 * @member {String} engine.model.Element#name
		 */
		this.name = name;

		/**
		 * List of children nodes.
		 *
		 * @protected
		 * @member {engine.model.NodeList} engine.model.Element#_children
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
	 * @returns {engine.model.Node} Child node.
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
	 * @param {engine.model.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * {@link engine.model.Element#insert Inserts} a child node or a list of child nodes at the end of this node and sets
	 * the parent of these nodes to this element.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link engine.model.operation.InsertOperation}.
	 *
	 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Inserts a list of child nodes on the given index and sets the parent of these nodes to this element.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link engine.model.operation.InsertOperation}.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		let nodeList = new NodeList( nodes );

		for ( let node of nodeList._nodes ) {
			node.parent = this;
		}

		// Clean original DocumentFragment so it won't contain nodes that were added somewhere else.
		if ( nodes instanceof DocumentFragment ) {
			nodes._children = new NodeList();
		}

		this._children.insert( index, nodeList );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * Note that the list of children can be modified only in elements not yet attached to the document.
	 * All attached nodes should be modified using the {@link engine.model.operation.RemoveOperation}.
	 *
	 * @param {Number} index Position of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {engine.model.NodeList} The list of removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		let nodeList = this._children.remove( index, howMany );

		for ( let node of nodeList._nodes ) {
			node.parent = null;
		}

		return nodeList;
	}

	/**
	 * Sets attribute on the element. If attribute with the same key already is set, it overwrites its value.
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
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set. See {@link engine.model.Node#getAttributes}.
	 */
	setAttributesTo( attrs ) {
		this._attrs = toMap( attrs );
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

	/**
	 * Checks whether element is empty (has no children).
	 *
	 * @returns {Boolean}
	 */
	isEmpty() {
		return this.getChildCount() === 0;
	}

	/**
	 * Gets the text content of the element. The return value is created by concatenating all
	 * text nodes in this element and its descendants.
	 *
	 * @returns {String}
	 */
	getText() {
		let text = '';

		for ( let value of Range.createFromElement( this ) ) {
			if ( value.type == 'text' ) {
				text += value.item.text;
			}
		}

		return text;
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @returns {Object} Clone of this object with the parent property replaced with its name.
	 */
	toJSON() {
		let json = super.toJSON();

		if ( this._children.length ) {
			json.children = this._children.toJSON();
		}

		json.name = this.name;

		return json;
	}

	/**
	 * Creates Element object from deserilized object, ie. from parsed JSON string.
	 *
	 *		let deserialized = JSON.parse( JSON.stringify( someElementObject ) );
	 *		let element = NodeList.fromJSON( deserialized );
	 *
	 * @param {Object} json
	 * @returns {engine.model.Element}
	 */
	static fromJSON( json ) {
		if ( json.children ) {
			return new Element( json.name, json.attributes, NodeList.fromJSON( json.children ) );
		}

		return new Element( json.name, json.attributes );
	}
}
