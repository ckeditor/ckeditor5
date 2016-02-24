/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Node from './node.js';
import utils from '../utils.js';
import isPlainObject from '../lib/lodash/isPlainObject.js';

/**
 * Tree view element.
 *
 * @memberOf core.treeView
 * @extends core.treeView.Node
 */
export default class Element extends Node {
	/**
	 * Creates a tree view element.
	 *
	 * Attributes can be passes in various formats:
	 *
	 *		new Element( 'div', { 'class': 'editor', 'contentEditable': 'true' } ); // object
	 *		new Element( 'div', [ [ 'class', 'editor' ], [ 'contentEditable', 'true' ] ] ); // map-like iterator
	 *		new Element( 'div', mapOfAttributes ); // map
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} [children] List of nodes to be inserted into created element.
	 */
	constructor( name, attrs, children ) {
		super();

		/**
		 * Name of the element.
		 *
		 * @readonly
		 * @member {String} core.treeView.Element#name
		 */
		this.name = name;

		/**
		 * Map of attributes, where attributes names are keys and attributes values are values.
		 *
		 * @protected
		 * @member {Map} core.treeView.Element#_attrs
		 */
		if ( isPlainObject( attrs ) ) {
			this._attrs = utils.objectToMap( attrs );
		} else {
			this._attrs = new Map( attrs );
		}

		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<core.treeView.Node>} core.treeView.Element#_children
		 */
		this._children = [];

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Clones provided element.
	 *
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {Element} Clone of this element.
	 */
	clone( deep ) {
		const childrenClone = [];

		if ( deep ) {
			for ( let child of this.getChildren() ) {
				childrenClone.push( child.clone( deep ) );
			}
		}

		return new Element( this.name, this._attrs, childrenClone );
	}

	/**
	 * {@link core.treeView.Element#insert Insert} a child node or a list of child nodes at the end of this node and sets
	 * the parent of these nodes to this element.
	 *
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @fires core.treeView.Node#change
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {core.treeView.Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
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
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {core.treeView.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<core.treeView.Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an iterator that contains the keys for attributes.
	 *
	 * @returns {Iterator.<String>} Keys for attributes.
	 */
	getAttributeKeys() {
		return this._attrs.keys();
	}

	/**
	 * Gets attribute by key.
	 *
	 * @param {String} key Attribute key.
	 * @returns {String} Attribute value.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns a boolean indicating whether an attribute with the specified key exists in the element.
	 *
	 * @param {String} key Attribute key.
	 * @returns {Boolean} `true` if attribute with the specified key exists in the element, false otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Adds or overwrite attribute with a specified key and value.
	 *
	 * @param {String} key Attribute key.
	 * @param {String} value Attribute value.
	 * @fires core.treeView.Node#change
	 */
	setAttribute( key, value ) {
		this._fireChange( 'ATTRIBUTES', this );

		this._attrs.set( key, value );
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this element.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {core.treeView.Node|Iterable.<core.treeView.Node>} nodes Node or the list of nodes to be inserted.
	 * @fires core.treeView.Node#change
	 */
	insertChildren( index, nodes ) {
		this._fireChange( 'CHILDREN', this );

		if ( !utils.isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
		}
	}

	/**
	 * Removes attribute from the element.
	 *
	 * @param {String} key Attribute key.
	 * @returns {Boolean} Returns true if an attribute existed and has been removed.
	 * @fires core.treeView.Node#change
	 */
	removeAttribute( key ) {
		this._fireChange( 'ATTRIBUTES', this );

		return this._attrs.delete( key );
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [number] Number of nodes to remove.
	 * @returns {Array.<core.treeView.Node>} The array of removed nodes.
	 * @fires core.treeView.Node#change
	 */
	removeChildren( index, number ) {
		this._fireChange( 'CHILDREN', this );

		if ( typeof number === 'undefined' ) {
			number = 1;
		}

		for ( let i = index; i < index + number; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, number );
	}

	/**
	 * Checks if this element is the same as other element.
	 * Both elements should have the same name and attributes to be considered as same.
	 *
	 * @param {Element} otherElement
	 * @returns {Boolean}
	 */
	same( otherElement ) {
		if ( !( otherElement instanceof Element ) ) {
			return false;
		}

		// If exactly the same Element is provided - return true immediately.
		if ( this === otherElement ) {
			return true;
		}

		// Check name and attributes.
		if ( this.name != otherElement.name ) {
			return false;
		}

		const thisNodeAttrKeys = this.getAttributeKeys();
		const otherNodeAttrKeys = otherElement.getAttributeKeys();
		let count = 0;

		for ( let key of thisNodeAttrKeys ) {
			if ( this.getAttribute( key ) !== otherElement.getAttribute( key ) ) {
				return false;
			}

			count++;
		}

		if ( count != utils.count( otherNodeAttrKeys ) ) {
			return false;
		}

		return true;
	}
}
