/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import NodeList from './nodelist.js';
import Element from './element.js';
import Text from './text.js';
import isIterable from '../../utils/isiterable.js';

/**
 * DocumentFragment represents a part of model which does not have a common root but it's top-level nodes
 * can be seen as siblings. In other words, it is a detached part of model tree, without a root.
 *
 * @memberOf engine.model
 */
export default class DocumentFragment {
	/**
	 * Creates an empty `DocumentFragment`.
	 *
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} children Nodes to be contained inside the `DocumentFragment`.
	 */
	constructor( children ) {
		/**
		 * List of nodes contained inside the document fragment.
		 *
		 * @private
		 * @member {engine.model.NodeList} engine.model.DocumentFragment#_children
		 */
		this._children = new NodeList();

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Returns an iterator that iterates over all nodes contained inside this document fragment.
	 *
	 * @returns {Iterator.<engine.model.Node>}
	 */
	[ Symbol.iterator ]() {
		return this.getChildren();
	}

	/**
	 * Returns the number of this document fragment's children.
	 *
	 * @returns {Number}
	 */
	get childCount() {
		return this._children.length;
	}

	/**
	 * Returns the sum of {engine.model.Node#offsetSize offset sizes} of all of this document fragment's children.
	 *
	 * @returns {Number}
	 */
	get maxOffset() {
		return this._children.maxOffset;
	}

	/**
	 * Returns `true` if there are no nodes inside this document fragment, `false` otherwise.
	 *
	 * @returns {Boolean}
	 */
	get isEmpty() {
		return this.childCount === 0;
	}

	/**
	 * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {engine.model.DocumentFragment}
	 */
	get root() {
		return this;
	}

	/**
	 * Gets the child at the given index. Returns `null` if incorrect index was passed.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.model.Node|null} Child node.
	 */
	getChild( index ) {
		return this._children.getNode( index );
	}

	/**
	 * Returns an iterator that iterates over all of this document fragment's children.
	 *
	 * @returns {Iterable.<engine.model.Node>}
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Returns an index of the given child node. Returns `null` if given node is not a child of this document fragment.
	 *
	 * @param {engine.model.Node} node Child node to look for.
	 * @returns {Number|null} Child node's index.
	 */
	getChildIndex( node ) {
		return this._children.getNodeIndex( node );
	}

	/**
	 * Returns the starting offset of given child. Starting offset is equal to the sum of
	 * {engine.model.Node#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
	 * given node is not a child of this document fragment.
	 *
	 * @param {engine.model.Node} node Child node to look for.
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
	 * Converts offset "position" to index "position".
	 *
	 * Returns index of a node that occupies given offset. If given offset is too low, returns `0`. If given offset is
	 * too high, returns {@link engine.model.DocumentFragment#getChildCount index after last child}.
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
	 * {@link engine.model.DocumentFragment#insertChildren Inserts} one or more nodes at the end of this document fragment.
	 *
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} nodes Nodes to be inserted.
	 */
	appendChildren( nodes ) {
		this.insertChildren( this.childCount, nodes );
	}

	/**
	 * Inserts one or more nodes at the given index and sets {@link engine.model.Node#parent parent} of these nodes
	 * to this document fragment.
	 *
	 * @param {Number} index Index at which nodes should be inserted.
	 * @param {engine.model.Node|Iterable.<engine.model.Node>} nodes Nodes to be inserted.
	 */
	insertChildren( index, nodes ) {
		nodes = normalize( nodes );

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
	 * Converts `DocumentFragment` instance to plain object and returns it.
	 * Takes care of converting all of this document fragment's children.
	 *
	 * @returns {Object} `DocumentFragment` instance converted to plain object.
	 */
	toJSON() {
		let json = [];

		for ( let node of this._children ) {
			json.push( node.toJSON() );
		}

		return json;
	}

	/**
	 * Creates a `DocumentFragment` instance from given plain object (i.e. parsed JSON string).
	 * Converts `DocumentFragment` children to proper nodes.
	 *
	 * @param {Object} json Plain object to be converted to `DocumentFragment`.
	 * @returns {engine.model.DocumentFragment} `DocumentFragment` instance created using given plain object.
	 */
	static fromJSON( json ) {
		let children = [];

		for ( let child of json ) {
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
// @param {String|engine.model.Node|Iterable.<String|engine.model.Node>}
// @return {Iterable.<engine.model.Node>}
function normalize( nodes ) {
	// Separate condition because string is iterable.
	if ( typeof nodes == 'string' ) {
		return [ new Text( nodes ) ];
	}

	if ( !isIterable( nodes ) ) {
		nodes = [ nodes ];
	}

	// Array.from to enable .map() on non-arrays.
	return Array.from( nodes ).map( ( node ) => typeof node == 'string' ? new Text( node ) : node );
}
