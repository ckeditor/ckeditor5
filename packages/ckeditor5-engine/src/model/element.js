/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/element
 */

import Node from './node';
import NodeList from './nodelist';
import Text from './text';
import TextProxy from './textproxy';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * Model element. Type of {@link module:engine/model/node~Node node} that has a {@link module:engine/model/element~Element#name name} and
 * {@link module:engine/model/element~Element#getChildren child nodes}.
 *
 * **Important**: see {@link module:engine/model/node~Node} to read about restrictions using `Element` and `Node` API.
 *
 * @extends module:engine/model/node~Node
 */
export default class Element extends Node {
	/**
	 * Creates a model element.
	 *
	 * **Note:** Constructor of this class shouldn't be used directly in the code.
	 * Use the {@link module:engine/model/writer~Writer#createElement} method instead.
	 *
	 * @protected
	 * @param {String} name Element's name.
	 * @param {Object} [attrs] Element's attributes. See {@link module:utils/tomap~toMap} for a list of accepted values.
	 * @param {module:engine/model/node~Node|Iterable.<module:engine/model/node~Node>} [children]
	 * One or more nodes to be inserted as children of created element.
	 */
	constructor( name, attrs, children ) {
		super( attrs );

		/**
		 * Element name.
		 *
		 * @readonly
		 * @member {String} module:engine/model/element~Element#name
		 */
		this.name = name;

		/**
		 * List of children nodes.
		 *
		 * @private
		 * @member {module:engine/model/nodelist~NodeList} module:engine/model/element~Element#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this._insertChild( 0, children );
		}
	}

	/**
	 * Number of this element's children.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get childCount() {
		return this._children.length;
	}

	/**
	 * Sum of {@link module:engine/model/node~Node#offsetSize offset sizes} of all of this element's children.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get maxOffset() {
		return this._children.maxOffset;
	}

	/**
	 * Is `true` if there are no nodes inside this element, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isEmpty() {
		return this.childCount === 0;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		element.is( 'element' ); // -> true
	 *		element.is( 'node' ); // -> true
	 *		element.is( 'model:element' ); // -> true
	 *		element.is( 'model:node' ); // -> true
	 *
	 *		element.is( 'view:element' ); // -> false
	 *		element.is( 'documentSelection' ); // -> false
	 *
	 * Assuming that the object being checked is an element, you can also check its
	 * {@link module:engine/model/element~Element#name name}:
	 *
	 *		element.is( 'image' ); // -> true if this is an <image> element
	 *		element.is( 'element', 'image' ); // -> same as above
	 *		text.is( 'image' ); -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		const cutType = type.replace( /^model:/, '' );

		if ( !name ) {
			return cutType == 'element' || cutType == this.name || super.is( type );
		} else {
			return cutType == 'element' && name == this.name;
		}
	}

	/**
	 * Gets the child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {module:engine/model/node~Node} Child node.
	 */
	getChild( index ) {
		return this._children.getNode( index );
	}

	/**
	 * Returns an iterator that iterates over all of this element's children.
	 *
	 * @returns {Iterable.<module:engine/model/node~Node>}
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an index of the given child node. Returns `null` if given node is not a child of this element.
	 *
	 * @param {module:engine/model/node~Node} node Child node to look for.
	 * @returns {Number} Child node's index in this element.
	 */
	getChildIndex( node ) {
		return this._children.getNodeIndex( node );
	}

	/**
	 * Returns the starting offset of given child. Starting offset is equal to the sum of
	 * {@link module:engine/model/node~Node#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
	 * given node is not a child of this element.
	 *
	 * @param {module:engine/model/node~Node} node Child node to look for.
	 * @returns {Number} Child node's starting offset.
	 */
	getChildStartOffset( node ) {
		return this._children.getNodeStartOffset( node );
	}

	/**
	 * Returns index of a node that occupies given offset. If given offset is too low, returns `0`. If given offset is
	 * too high, returns {@link module:engine/model/element~Element#getChildIndex index after last child}.
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
	 * Returns a descendant node by its path relative to this element.
	 *
	 *		// <this>a<b>c</b></this>
	 *		this.getNodeByPath( [ 0 ] );     // -> "a"
	 *		this.getNodeByPath( [ 1 ] );     // -> <b>
	 *		this.getNodeByPath( [ 1, 0 ] );  // -> "c"
	 *
	 * @param {Array.<Number>} relativePath Path of the node to find, relative to this element.
	 * @returns {module:engine/model/node~Node}
	 */
	getNodeByPath( relativePath ) {
		let node = this; // eslint-disable-line consistent-this

		for ( const index of relativePath ) {
			node = node.getChild( node.offsetToIndex( index ) );
		}

		return node;
	}

	/**
	 * Converts `Element` instance to plain object and returns it. Takes care of converting all of this element's children.
	 *
	 * @returns {Object} `Element` instance converted to plain object.
	 */
	toJSON() {
		const json = super.toJSON();

		json.name = this.name;

		if ( this._children.length > 0 ) {
			json.children = [];

			for ( const node of this._children ) {
				json.children.push( node.toJSON() );
			}
		}

		return json;
	}

	/**
	 * Creates a copy of this element and returns it. Created element has the same name and attributes as the original element.
	 * If clone is deep, the original element's children are also cloned. If not, then empty element is removed.
	 *
	 * @protected
	 * @param {Boolean} [deep=false] If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any child.
	 */
	_clone( deep = false ) {
		const children = deep ? Array.from( this._children ).map( node => node._clone( true ) ) : null;

		return new Element( this.name, this.getAttributes(), children );
	}

	/**
	 * {@link module:engine/model/element~Element#_insertChild Inserts} one or more nodes at the end of this element.
	 *
	 * @see module:engine/model/writer~Writer#append
	 * @protected
	 * @param {module:engine/model/item~Item|Iterable.<module:engine/model/item~Item>} nodes Nodes to be inserted.
	 */
	_appendChild( nodes ) {
		this._insertChild( this.childCount, nodes );
	}

	/**
	 * Inserts one or more nodes at the given index and sets {@link module:engine/model/node~Node#parent parent} of these nodes
	 * to this element.
	 *
	 * @see module:engine/model/writer~Writer#insert
	 * @protected
	 * @param {Number} index Index at which nodes should be inserted.
	 * @param {module:engine/model/item~Item|Iterable.<module:engine/model/item~Item>} items Items to be inserted.
	 */
	_insertChild( index, items ) {
		const nodes = normalize( items );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node._remove();
			}

			node.parent = this;
		}

		this._children._insertNodes( index, nodes );
	}

	/**
	 * Removes one or more nodes starting at the given index and sets
	 * {@link module:engine/model/node~Node#parent parent} of these nodes to `null`.
	 *
	 * @see module:engine/model/writer~Writer#remove
	 * @protected
	 * @param {Number} index Index of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<module:engine/model/node~Node>} Array containing removed nodes.
	 */
	_removeChildren( index, howMany = 1 ) {
		const nodes = this._children._removeNodes( index, howMany );

		for ( const node of nodes ) {
			node.parent = null;
		}

		return nodes;
	}

	/**
	 * Creates an `Element` instance from given plain object (i.e. parsed JSON string).
	 * Converts `Element` children to proper nodes.
	 *
	 * @param {Object} json Plain object to be converted to `Element`.
	 * @returns {module:engine/model/element~Element} `Element` instance created using given plain object.
	 */
	static fromJSON( json ) {
		let children = null;

		if ( json.children ) {
			children = [];

			for ( const child of json.children ) {
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

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/model/item~Item|Iterable.<String|module:engine/model/item~Item>}
// @returns {Iterable.<module:engine/model/node~Node>}
function normalize( nodes ) {
	// Separate condition because string is iterable.
	if ( typeof nodes == 'string' ) {
		return [ new Text( nodes ) ];
	}

	if ( !isIterable( nodes ) ) {
		nodes = [ nodes ];
	}

	// Array.from to enable .map() on non-arrays.
	return Array.from( nodes )
		.map( node => {
			if ( typeof node == 'string' ) {
				return new Text( node );
			}

			if ( node instanceof TextProxy ) {
				return new Text( node.data, node.getAttributes() );
			}

			return node;
		} );
}
