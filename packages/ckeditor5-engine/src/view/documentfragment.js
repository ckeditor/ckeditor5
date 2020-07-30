/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/documentfragment
 */

import Text from './text';
import TextProxy from './textproxy';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * Document fragment.
 *
 * To create a new document fragment instance use the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createDocumentFragment `UpcastWriter#createDocumentFragment()`}
 * method.
 */
export default class DocumentFragment {
	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @protected
	 * @param {module:engine/view/document~Document} document The document to which this document fragment belongs.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into the created document fragment.
	 */
	constructor( document, children ) {
		/**
		 * The document to which this document fragment belongs.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document}
		 */
		this.document = document;

		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<module:engine/view/element~Element>} module:engine/view/documentfragment~DocumentFragment#_children
		 */
		this._children = [];

		if ( children ) {
			this._insertChild( 0, children );
		}
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over nodes added to this document fragment.
	 *
	 * @returns {Iterable.<module:engine/view/node~Node>}
	 */
	[ Symbol.iterator ]() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Number of child nodes in this document fragment.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get childCount() {
		return this._children.length;
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
	 *		docFrag.is( 'view:documentFragment' ); // -> true
	 *
	 *		docFrag.is( 'model:documentFragment' ); // -> false
	 *		docFrag.is( 'element' ); // -> false
	 *		docFrag.is( 'node' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'documentFragment' || type === 'view:documentFragment';
	}

	/**
	 * {@link module:engine/view/documentfragment~DocumentFragment#_insertChild Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @returns {Number} Number of appended nodes.
	 */
	_appendChild( items ) {
		return this._insertChild( this.childCount, items );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {module:engine/view/node~Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {module:engine/view/node~Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<module:engine/view/node~Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this fragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {module:engine/view/item~Item|Iterable.<module:engine/view/item~Item>} items Items to be inserted.
	 * @returns {Number} Number of inserted nodes.
	 */
	_insertChild( index, items ) {
		this._fireChange( 'children', this );
		let count = 0;

		const nodes = normalize( this.document, items );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node._remove();
			}

			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<module:engine/view/node~Node>} The array of removed nodes.
	 */
	_removeChildren( index, howMany = 1 ) {
		this._fireChange( 'children', this );

		for ( let i = index; i < index + howMany; i++ ) {
			this._children[ i ].parent = null;
		}

		return this._children.splice( index, howMany );
	}

	/**
	 * Fires `change` event with given type of the change.
	 *
	 * @private
	 * @param {module:engine/view/document~ChangeType} type Type of the change.
	 * @param {module:engine/view/node~Node} node Changed node.
	 * @fires module:engine/view/node~Node#change
	 */
	_fireChange( type, node ) {
		this.fire( 'change:' + type, node );
	}

	// @if CK_DEBUG_ENGINE // printTree() {
	// @if CK_DEBUG_ENGINE //	let string = 'ViewDocumentFragment: [';

	// @if CK_DEBUG_ENGINE //	for ( const child of this.getChildren() ) {
	// @if CK_DEBUG_ENGINE //		if ( child.is( '$text' ) ) {
	// @if CK_DEBUG_ENGINE //			string += '\n' + '\t'.repeat( 1 ) + child.data;
	// @if CK_DEBUG_ENGINE //		} else {
	// @if CK_DEBUG_ENGINE //			string += '\n' + child.printTree( 1 );
	// @if CK_DEBUG_ENGINE //		}
	// @if CK_DEBUG_ENGINE //	}

	// @if CK_DEBUG_ENGINE //	string += '\n]';

	// @if CK_DEBUG_ENGINE //	return string;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logTree() {
	// @if CK_DEBUG_ENGINE // 	console.log( this.printTree() );
	// @if CK_DEBUG_ENGINE // }
}

mix( DocumentFragment, EmitterMixin );

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/view/item~Item|Iterable.<String|module:engine/view/item~Item>}
// @returns {Iterable.<module:engine/view/node~Node>}
function normalize( document, nodes ) {
	// Separate condition because string is iterable.
	if ( typeof nodes == 'string' ) {
		return [ new Text( document, nodes ) ];
	}

	if ( !isIterable( nodes ) ) {
		nodes = [ nodes ];
	}

	// Array.from to enable .map() on non-arrays.
	return Array.from( nodes )
		.map( node => {
			if ( typeof node == 'string' ) {
				return new Text( document, node );
			}

			if ( node instanceof TextProxy ) {
				return new Text( document, node.data );
			}

			return node;
		} );
}
