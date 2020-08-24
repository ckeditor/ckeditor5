/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module module:engine/model/documentfragment
 */

import NodeList from './nodelist';
import Element from './element';
import Text from './text';
import TextProxy from './textproxy';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';

// @if CK_DEBUG_ENGINE // const { stringifyMap } = require( '../dev-utils/utils' );

/**
 * DocumentFragment represents a part of model which does not have a common root but it's top-level nodes
 * can be seen as siblings. In other words, it is a detached part of model tree, without a root.
 *
 * DocumentFragment has own {@link module:engine/model/markercollection~MarkerCollection}. Markers from this collection
 * will be set to the {@link module:engine/model/model~Model#markers model markers} by a
 * {@link module:engine/model/writer~Writer#insert} function.
 */
export default class DocumentFragment {
	/**
	 * Creates an empty `DocumentFragment`.
	 *
	 * **Note:** Constructor of this class shouldn't be used directly in the code.
	 * Use the {@link module:engine/model/writer~Writer#createDocumentFragment} method instead.
	 *
	 * @protected
	 * @param {module:engine/model/node~Node|Iterable.<module:engine/model/node~Node>} [children]
	 * Nodes to be contained inside the `DocumentFragment`.
	 */
	constructor( children ) {
		/**
		 * DocumentFragment static markers map. This is a list of names and {@link module:engine/model/range~Range ranges}
		 * which will be set as Markers to {@link module:engine/model/model~Model#markers model markers collection}
		 * when DocumentFragment will be inserted to the document.
		 *
		 * @readonly
		 * @member {Map<String,module:engine/model/range~Range>} module:engine/model/documentfragment~DocumentFragment#markers
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
			this._insertChild( 0, children );
		}
	}

	/**
	 * Returns an iterator that iterates over all nodes contained inside this document fragment.
	 *
	 * @returns {Iterable.<module:engine/model/node~Node>}
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
	 * Sum of {@link module:engine/model/node~Node#offsetSize offset sizes} of all of this document fragment's children.
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
	 * Checks whether this object is of the given type.
	 *
	 *		docFrag.is( 'documentFragment' ); // -> true
	 *		docFrag.is( 'model:documentFragment' ); // -> true
	 *
	 *		docFrag.is( 'view:documentFragment' ); // -> false
	 *		docFrag.is( 'element' ); // -> false
	 *		docFrag.is( 'node' ); // -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'documentFragment' || type === 'model:documentFragment';
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
	 * {@link module:engine/model/node~Node#offsetSize offset sizes} of all node's siblings that are before it. Returns `null` if
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

	/**
	 * {@link #_insertChild Inserts} one or more nodes at the end of this document fragment.
	 *
	 * @protected
	 * @param {module:engine/model/item~Item|Iterable.<module:engine/model/item~Item>} items Items to be inserted.
	 */
	_appendChild( items ) {
		this._insertChild( this.childCount, items );
	}

	/**
	 * Inserts one or more nodes at the given index and sets {@link module:engine/model/node~Node#parent parent} of these nodes
	 * to this document fragment.
	 *
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
	 * Removes one or more nodes starting at the given index
	 * and sets {@link module:engine/model/node~Node#parent parent} of these nodes to `null`.
	 *
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

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return 'documentFragment';
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ModelDocumentFragment: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // printTree() {
	// @if CK_DEBUG_ENGINE //	let string = 'ModelDocumentFragment: [';

	// @if CK_DEBUG_ENGINE //	for ( const child of this.getChildren() ) {
	// @if CK_DEBUG_ENGINE //		string += '\n';

	// @if CK_DEBUG_ENGINE //		if ( child.is( '$text' ) ) {
	// @if CK_DEBUG_ENGINE //			const textAttrs = stringifyMap( child._attrs );

	// @if CK_DEBUG_ENGINE //			string += '\t'.repeat( 1 );

	// @if CK_DEBUG_ENGINE //			if ( textAttrs !== '' ) {
	// @if CK_DEBUG_ENGINE //				string += `<$text${ textAttrs }>` + child.data + '</$text>';
	// @if CK_DEBUG_ENGINE //			} else {
	// @if CK_DEBUG_ENGINE //				string += child.data;
	// @if CK_DEBUG_ENGINE //			}
	// @if CK_DEBUG_ENGINE //		} else {
	// @if CK_DEBUG_ENGINE //			string += child.printTree( 1 );
	// @if CK_DEBUG_ENGINE //		}
	// @if CK_DEBUG_ENGINE //	}

	// @if CK_DEBUG_ENGINE //	string += '\n]';

	// @if CK_DEBUG_ENGINE //	return string;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logTree() {
	// @if CK_DEBUG_ENGINE // 	console.log( this.printTree() );
	// @if CK_DEBUG_ENGINE // }
}

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/model/item~Item|Iterable.<module:engine/model/item~Item>}
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
