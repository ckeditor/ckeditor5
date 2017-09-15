/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/documentfragment
 */

import Text from './text';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import isIterable from '@ckeditor/ckeditor5-utils/src/isiterable';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * DocumentFragment class.
 */
export default class DocumentFragment {
	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children] List of nodes to be inserted into
	 * created document fragment.
	 */
	constructor( children ) {
		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<module:engine/view/element~Element>} module:engine/view/documentfragment~DocumentFragment#_children
		 */
		this._children = [];

		if ( children ) {
			this.insertChildren( 0, children );
		}
	}

	/**
	 * Iterates over nodes added to this DocumentFragment.
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
	 * Checks whether given view tree object is of given type.
	 *
	 * Read more in {@link module:engine/view/node~Node#is}.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type == 'documentFragment';
	}

	/**
	 * {@link module:engine/view/documentfragment~DocumentFragment#insertChildren Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} nodes Node or the list of nodes to be inserted.
	 * @returns {Number} Number of appended nodes.
	 */
	appendChildren( nodes ) {
		return this.insertChildren( this.childCount, nodes );
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
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} nodes Node or list of nodes to be inserted.
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChildren( index, nodes ) {
		this._fireChange( 'children', this );
		let count = 0;

		nodes = normalize( nodes );

		for ( const node of nodes ) {
			// If node that is being added to this element is already inside another element, first remove it from the old parent.
			if ( node.parent !== null ) {
				node.remove();
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
	removeChildren( index, howMany = 1 ) {
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
}

mix( DocumentFragment, EmitterMixin );

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|module:engine/view/node~Node|Iterable.<String|module:engine/view/node~Node>}
// @return {Iterable.<module:engine/view/node~Node>}
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
