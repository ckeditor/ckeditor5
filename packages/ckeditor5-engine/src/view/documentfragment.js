/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Text from './text.js';
import mix from '../../utils/mix.js';
import isIterable from '../../utils/isiterable.js';
import EmitterMixin from '../../utils/emittermixin.js';

/**
 * DocumentFragment class.
 *
 * @memberOf engine.view
 */
export default class DocumentFragment {
	/**
	 * Creates new DocumentFragment instance.
	 *
	 * @param {engine.view.Node|Iterable.<engine.view.Node>} [children] List of nodes to be inserted into
	 * created document fragment.
	 */
	constructor( children ) {
		/**
		 * Array of child nodes.
		 *
		 * @protected
		 * @member {Array.<engine.view.Element>} engine.view.DocumentFragment#_children
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
	 * Artificial root of `DocumentFragment`. Returns itself. Added for compatibility reasons.
	 *
	 * @readonly
	 * @type {engine.model.DocumentFragment}
	 */
	get root() {
		return this;
	}

	/**
	 * Returns ancestor elements of `DocumentFragment`, which is an empty array. Added for compatibility reasons.
	 *
	 * @returns {Array}
	 */
	getAncestors() {
		return [];
	}

	/**
	 * {@link engine.view.DocumentFragment#insertChildren Insert} a child node or a list of child nodes at the end
	 * and sets the parent of these nodes to this fragment.
	 *
	 * @param {engine.view.Node|Iterable.<engine.view.Node>} nodes Node or the list of nodes to be inserted.
	 * @returns {Number} Number of appended nodes.
	 */
	appendChildren( nodes ) {
		return this.insertChildren( this.getChildCount(), nodes );
	}

	/**
	 * Gets child at the given index.
	 *
	 * @param {Number} index Index of child.
	 * @returns {engine.view.Node} Child node.
	 */
	getChild( index ) {
		return this._children[ index ];
	}

	/**
	 * Gets the number of elements in fragment.
	 *
	 * @returns {Number} The number of elements.
	 */
	getChildCount() {
		return this._children.length;
	}

	/**
	 * Gets index of the given child node. Returns `-1` if child node is not found.
	 *
	 * @param {engine.view.Node} node Child node.
	 * @returns {Number} Index of the child node.
	 */
	getChildIndex( node ) {
		return this._children.indexOf( node );
	}

	/**
	 * Gets child nodes iterator.
	 *
	 * @returns {Iterable.<engine.view.Node>} Child nodes iterator.
	 */
	getChildren() {
		return this._children[ Symbol.iterator ]();
	}

	/**
	 * Inserts a child node or a list of child nodes on the given index and sets the parent of these nodes to
	 * this fragment.
	 *
	 * @param {Number} index Position where nodes should be inserted.
	 * @param {engine.view.Node|Iterable.<engine.view.Node>} nodes Node or list of nodes to be inserted.
	 * @returns {Number} Number of inserted nodes.
	 */
	insertChildren( index, nodes ) {
		this._fireChange( 'children', this );
		let count = 0;

		nodes = normalize( nodes );

		for ( let node of nodes ) {
			node.parent = this;

			this._children.splice( index, 0, node );
			index++;
			count++;
		}

		return count;
	}

	/**
	 * Returns `true` if there are no nodes inside this document fragment, `false` otherwise.
	 *
	 * @returns {Boolean}
	 */
	isEmpty() {
		return this.getChildCount() === 0;
	}

	/**
	 * Removes number of child nodes starting at the given index and set the parent of these nodes to `null`.
	 *
	 * @param {Number} index Number of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<engine.view.Node>} The array of removed nodes.
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
	 * @param {engine.view.ChangeType} type Type of the change.
	 * @param {engine.view.Node} node Changed node.
	 * @fires engine.view.Node#change
	 */
	_fireChange( type, node ) {
		this.fire( 'change:' + type, node );
	}
}

mix( DocumentFragment, EmitterMixin );

// Converts strings to Text and non-iterables to arrays.
//
// @param {String|engine.view.Node|Iterable.<String|engine.view.Node>}
// @return {Iterable.<engine.view.Node>}
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
