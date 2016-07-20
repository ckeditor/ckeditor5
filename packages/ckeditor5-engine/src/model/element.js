/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Node from './node.js';
import NodeList from './nodelist.js';
import Text from './text.js';
import isIterable from '../../utils/isiterable.js';

/**
 * Model element. Type of {@link engine.model.Node node} that has a {@link engine.model.Element#name name} and
 * {@link engine.model.Element#getChildren child nodes}.
 *
 * **Important**: see {@link engine.model.Node} to read about restrictions using `Element` and `Node` API.
 *
 * @memberOf engine.model
 */
export default class Element extends Node {
	/**
	 * Creates a model element.
	 *
	 * @param {String} name Element's name.
	 * @param {Object} [attrs] Element's attributes. See {@link utils.toMap} for a list of accepted values.
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} [children] One or more nodes to be inserted as children of
	 * created element.
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
		 * @private
		 * @member {engine.model.NodeList} engine.model.Element#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Creates a copy of this element and returns it. Created element has same name and attributes as original element.
	 * If clone is not deep, children of copied element are references to the same nodes as in original element.
	 * If clone is deep, original element's children are also cloned.
	 *
	 * @param {Boolean} [deep=false] Decides whether children of this element should also be cloned (`true`) or not (`false`).
	 */
	clone( deep = false ) {
		const children = deep ?
			Array.from( this._children ).map( ( node ) => node.clone() ) :
			Array.from( this._children );

		return new Element( this.name, this.getAttributes(), children );
	}

	/**
	 * Returns `true` if there are no nodes inside this element, `false` otherwise.
	 *
	 * @returns {Boolean}
	 */
	isEmpty() {
		return this.getChildCount() === 0;
	}

	/**
	 * Gets the child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.model.Node} Child node.
	 */
	getChild( index ) {
		return this._children.getNode( index );
	}

	/**
	 * Returns an index of the given child node. Returns `null` if given node is not a child of this element.
	 *
	 * @param {engine.model.Node} node Child node to look for.
	 * @returns {Number} Child node's index in this element.
	 */
	getChildIndex( node ) {
		return this._children.getNodeIndex( node );
	}

	/**
	 * Returns an iterator that iterates over all of this element's children.
	 *
	 * @returns {Iterable.<engine.model.Node>}
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns the number of this element's children.
	 *
	 * @returns {Number}
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Returns the starting offset of given child. Starting offset is equal to the sum of
	 * {engine.model.Node#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
	 * given node is not a child of this element.
	 *
	 * @param {engine.model.Node} node Child node to look for.
	 * @returns {Number} Child node's starting offset.
	 */
	getChildStartOffset( node ) {
		return this._children.getNodeStartOffset( node );
	}

	/**
	 * Returns the sum of {engine.model.Node#offsetSize offset sizes} of all of this element's children.
	 *
	 * @returns {Number}
	 */
	getMaxOffset() {
		return this._children.totalOffset;
	}

	/**
	 * Returns index of a node that occupies given offset. If given offset is too low, returns `0`. If given offset is
	 * too high, returns {@link engine.model.Element#getChildCount index after last child}.
	 *
	 *		const textNode = new Text( 'foo' );
	 *		const pElement = new Element( 'p' );
	 *		const divElement = new Element( [ textNode, pElement ] );
	 *		divElement.offsetToIndex( -1 ); // Returns 0, because offset is too low.
	 *		divElement.offsetToIndex( 0 ); // Returns 0, because offset 0 is taken by `textNode` which is at index 0.
	 *		divElement.offsetToIndex( 1 ); // Returns 0, because `textNode` has `offsetSize` equal to 3, so it occupies offset 1 too.
	 *		divElement.offsetToIndex( 2 ); // Returns 0.
	 *		divElement.offsetToIndex( 3 ); // Returns 1.
	 *		divElement.offsetToIndex( 4 ); // Returns 2. There are no nodes at offset 4, so last available index is returned.
	 *
	 * @param {Number} offset Offset to look for.
	 * @returns {Number}
	 */
	offsetToIndex( offset ) {
		return this._children.offsetToIndex( offset );
	}

	/**
	 * {@link engine.model.Element#insertChildren Inserts} one or more nodes at the end of this element.
	 *
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} nodes Nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Inserts one or more nodes at the given index and sets {@link engine.model.Node#parent parent} of these nodes
	 * to this element.
	 *
	 * @param {Number} index Index at which nodes should be inserted.
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} nodes Nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		if ( !isIterable( nodes ) ) {
			nodes = [ nodes ];
		}

		for ( let node of nodes ) {
			node.parent = this;
		}

		this._children.insertNodes( index, nodes );
	}

	/**
	 * Removes one or more nodes starting at the given index and sets {@link engine.model.Node#parent parent} of these nodes to `null`.
	 *
	 * @param {Number} index Index of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<engine.model.Node>} Array containing removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		const nodes = this._children.removeNodes( index, howMany );

		for ( let node of nodes ) {
			node.parent = null;
		}

		return nodes;
	}

	/**
	 * Converts `Element` instance to plain object and returns it. Takes care of converting all of this element's children.
	 *
	 * @returns {Object} `Element` instance converted to plain object.
	 */
	toJSON() {
		let json = super.toJSON();

		json.name = this.name;

		if ( this._children.length > 0 ) {
			json.children = [];

			for ( let node of this._children ) {
				json.children.push( node.toJSON() );
			}
		}

		return json;
	}

	/**
	 * Creates an `Element` instance from given plain object (i.e. parsed JSON string).
	 * Converts `Element` children to proper nodes.
	 *
	 * @param {Object} json Plain object to be converted to `Element`.
	 * @returns {engine.model.Element} `Element` instance created using given plain object.
	 */
	static fromJSON( json ) {
		let children = null;

		if ( json.children ) {
			children = [];

			for ( let child of json.children ) {
				if ( child.name ) {
					// If child has name property, it is an Element.
					children.push( Element.fromJSON( child ) );
				} else {
					// Otherwise, it is a Text node.
					children.push( Text.fromJSON( child ) );
				}
			}
		}

		return new Element( json.name, json.attributes, children );
	}
}
