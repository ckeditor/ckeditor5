/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module module:engine/model/documentfragment
 */

import NodeList from './nodelist';
import Element from './element';
import Text from './text';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

/**
 * DocumentFragment represents a part of model which does not have a common root but it's top-level nodes
 * can be seen as siblings. In other words, it is a detached part of model tree, without a root.
 *
 * DocumentFragment has own {@link module:engine/model/markercollection~MarkerCollection}. Markers from this collection
 * will be set to the {@link module:engine/model/document~Document#markers document markers} by a
 * {@link module:engine/model/writer~writer.insert} function.
 */
export default class DocumentFragment {
	/**
	 * Creates an empty `DocumentFragment`.
	 *
	 * @param {module:engine/model/node~Node|Iterable.<module:engine/model/node~Node>} [children]
	 * Nodes to be contained inside the `DocumentFragment`.
	 */
	constructor( children ) {
		/**
		 * DocumentFragment static markers map. This is a list of names and {@link module:engine/model/range~Range ranges}
		 * which will be set as Markers to {@link module:engine/model/document~Document#markers document markers collection}
		 * when DocumentFragment will be inserted to the document.
		 *
		 * @member {Map<String, {module:engine/model/range~Range}>} module:engine/model/documentfragment~DocumentFragment#markers
		 */
		this.markers = new Map();

		/**
		 * List of nodes contained inside the document fragment.
		 *
		 * @private
		 * @member {module:engine/model/nodelist~NodeList} module:engine/model/documentfragment~DocumentFragment#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Returns an iterator that iterates over all nodes contained inside this document fragment.
	 *
	 * @returns {Iterator.<module:engine/model/node~Node>}
	 */
	[ Symbol.iterator ]() {
		return this.getChildren();
	}

	/**
	 * Number of this document fragment's children.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get childCount() {
		return this._children.length;
	}

	/**
	 * Sum of {module:engine/model/node~Node#offsetSize offset sizes} of all of this document fragment's children.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get maxOffset() {
		return this._children.maxOffset;
	}

	/**
	 * Is `true` if there are no nodes inside this document fragment, `false` otherwise.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isEmpty() {
		return this.childCount === 0;
	}

	/**
	 * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {module:engine/model/documentfragment~DocumentFragment}
	 */
	get root() {
		return this;
	}

	/**
	 * Artificial parent of `DocumentFragment`. Returns `null`. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {null}
	 */
	get parent() {
		return null;
	}

	/**
	 * Checks whether given model tree object is of given type.
	 *
	 * Read more in {@link module:engine/model/node~Node#is}.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type == 'documentFragment';
	}

	/**
	 * Gets the child at the given index. Returns `null` if incorrect index was passed.
	 *
	 * @param {Number} index Index of child.
	 * @returns {module:engine/model/node~Node|null} Child node.
	 */
	getChild( index ) {
		return this._children.getNode( index );
	}

	/**
	 * Returns an iterator that iterates over all of this document fragment's children.
	 *
	 * @returns {Iterable.<module:engine/model/node~Node>}
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an index of the given child node. Returns `null` if given node is not a child of this document fragment.
	 *
	 * @param {module:engine/model/node~Node} node Child node to look for.
	 * @returns {Number|null} Child node's index.
	 */
	getChildIndex( node ) {
		return this._children.getNodeIndex( node );
	}

	/**
	 * Returns the starting offset of given child. Starting offset is equal to the sum of
	 * {module:engine/model/node~Node#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
	 * given node is not a child of this document fragment.
	 *
	 * @param {module:engine/model/node~Node} node Child node to look for.
	 * @returns {Number|null} Child node's starting offset.
	 */
	getChildStartOffset( node ) {
		return this._children.getNodeStartOffset( node );
	}

	/**
	 * Returns path to a `DocumentFragment`, which is an empty array. Added for compatibility reasons.
	 *
	 * @returns {Array}
	 */
	getPath() {
		return [];
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
	 * @returns {module:engine/model/node~Node|module:engine/model/documentfragment~DocumentFragment}
	 */
	getNodeByPath( relativePath ) {
		let node = this; // eslint-disable-line consistent-this

		for ( const index of relativePath ) {
			node = node.getChild( node.offsetToIndex( index ) );
		}

		return node;
	}

	/**
	 * Converts offset "position" to index "position".
	 *
	 * Returns index of a node that occupies given offset. If given offset is too low, returns `0`. If given offset is
	 * too high, returns index after last child}.
	 *
	 *		const textNode = new Text( 'foo' );
	 *		const pElement = new Element( 'p' );
	 *		const docFrag = new DocumentFragment( [ textNode, pElement ] );
	 *		docFrag.offsetToIndex( -1 ); // Returns 0, because offset is too low.
	 *		docFrag.offsetToIndex( 0 ); // Returns 0, because offset 0 is taken by `textNode` which is at index 0.
	 *		docFrag.offsetToIndex( 1 ); // Returns 0, because `textNode` has `offsetSize` equal to 3, so it occupies offset 1 too.
	 *		docFrag.offsetToIndex( 2 ); // Returns 0.
	 *		docFrag.offsetToIndex( 3 ); // Returns 1.
	 *		docFrag.offsetToIndex( 4 ); // Returns 2. There are no nodes at offset 4, so last available index is returned.
	 *
	 * @param {Number} offset Offset to look for.
	 * @returns {Number} Index of a node that occupies given offset.
	 */
	offsetToIndex( offset ) {
		return this._children.offsetToIndex( offset );
	}

	/**
	 * {@link #insertChildren Inserts} one or more nodes at the end of this document fragment.
	 *
	 * @param {module:engine/model/node~Node|Iterable.<module:engine/model/node~Node>} nodes Nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.childCount, nodes );
	}

	/**
	 * Inserts one or more nodes at the given index and sets {@link module:engine/model/node~Node#parent parent} of these nodes
	 * to this document fragment.
	 *
	 * @param {Number} index Index at which nodes should be inserted.
	 * @param {module:engine/model/node~Node|Iterable.<module:engine/model/node~Node>} nodes Nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		nodes = normalize( nodes );

		for ( const node of nodes ) {
			node.parent = this;
		}

		this._children.insertNodes( index, nodes );
	}

	/**
	 * Removes one or more nodes starting at the given index
	 * and sets {@link module:engine/model/node~Node#parent parent} of these nodes to `null`.
	 *
	 * @param {Number} index Index of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<module:engine/model/node~Node>} Array containing removed nodes.
	 */
	removeChildren( index, howMany = 1 ) {
		const nodes = this._children.removeNodes( index, howMany );

		for ( const node of nodes ) {
			node.parent = null;
		}

		return nodes;
	}

	/**
	 * Converts `DocumentFragment` instance to plain object and returns it.
	 * Takes care of converting all of this document fragment's children.
	 *
	 * @returns {Object} `DocumentFragment` instance converted to plain object.
	 */
	toJSON() {
		const json = [];

		for ( const node of this._children ) {
			json.push( node.toJSON() );
		}

		return json;
	}

	/**
	 * Creates a `DocumentFragment` instance from given plain object (i.e. parsed JSON string).
	 * Converts `DocumentFragment` children to proper nodes.
	 *
	 * @param {Object} json Plain object to be converted to `DocumentFragment`.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} `DocumentFragment` instance created using given plain object.
	 */
	static fromJSON( json ) {
		const children = [];

		for ( const child of json ) {
			if ( child.name ) {
				// If child has name property, it is an Element.
				children.push( Element.fromJSON( child ) );
			} else {
				// Otherwise, it is a Text node.
				children.push( Text.fromJSON( child ) );
			}
		}

		return new DocumentFragment( children );
	}
}

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/model/node~Node|Iterable.<String|module:engine/model/node~Node>}
// @return {Iterable.<module:engine/model/node~Node>}
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
			return typeof node == 'string' ? new Text( node ) : node;
		} );
}
