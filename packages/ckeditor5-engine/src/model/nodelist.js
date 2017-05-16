/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/nodelist
 */

import Node from './node';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Provides an interface to operate on a list of {@link module:engine/model/node~Node nodes}. `NodeList` is used internally
 * in classes like {@link module:engine/model/element~Element Element}
 * or {@link module:engine/model/documentfragment~DocumentFragment DocumentFragment}.
 */
export default class NodeList {
	/**
	 * Creates an empty node list.
	 *
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes contained in this node list.
	 */
	constructor( nodes ) {
		/**
		 * Nodes contained in this node list.
		 *
		 * @private
		 * @member {Array.<module:engine/model/node~Node>}
		 */
		this._nodes = [];

		if ( nodes ) {
			this.insertNodes( 0, nodes );
		}
	}

	/**
	 * Returns an iterator that iterates over all nodes contained inside this node list.
	 *
	 * @returns {Iterator.<module:engine/model/node~Node>}
	 */
	[ Symbol.iterator ]() {
		return this._nodes[ Symbol.iterator ]();
	}

	/**
	 * Number of nodes contained inside this node list.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get length() {
		return this._nodes.length;
	}

	/**
	 * Sum of {@link module:engine/model/node~Node#offsetSize offset sizes} of all nodes contained inside this node list.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get maxOffset() {
		return this._nodes.reduce( ( sum, node ) => sum + node.offsetSize, 0 );
	}

	/**
	 * Gets the node at the given index. Returns `null` if incorrect index was passed.
	 *
	 * @param {Number} index Index of node.
	 * @returns {module:engine/model/node~Node|null} Node at given index.
	 */
	getNode( index ) {
		return this._nodes[ index ] || null;
	}

	/**
	 * Returns an index of the given node. Returns `null` if given node is not inside this node list.
	 *
	 * @param {module:engine/model/node~Node} node Child node to look for.
	 * @returns {Number|null} Child node's index.
	 */
	getNodeIndex( node ) {
		const index = this._nodes.indexOf( node );

		return index == -1 ? null : index;
	}

	/**
	 * Returns the starting offset of given node. Starting offset is equal to the sum of
	 * {module:engine/model/node~Node#offsetSize offset sizes} of all nodes that are before this node in this node list.
	 *
	 * @param {module:engine/model/node~Node} node Node to look for.
	 * @returns {Number|null} Node's starting offset.
	 */
	getNodeStartOffset( node ) {
		const index = this.getNodeIndex( node );

		return index === null ? null : this._nodes.slice( 0, index ).reduce( ( sum, node ) => sum + node.offsetSize, 0 );
	}

	/**
	 * Converts index to offset in node list.
	 *
	 * Returns starting offset of a node that is at given index. Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * `model-nodelist-index-out-of-bounds` if given index is less than `0` or more than {@link #length}.
	 *
	 * @param {Number} index Node's index.
	 * @returns {Number} Node's starting offset.
	 */
	indexToOffset( index ) {
		if ( index == this._nodes.length ) {
			return this.maxOffset;
		}

		const node = this._nodes[ index ];

		if ( !node ) {
			/**
			 * Given index cannot be found in the node list.
			 *
			 * @error nodelist-index-out-of-bounds
			 */
			throw new CKEditorError( 'model-nodelist-index-out-of-bounds: Given index cannot be found in the node list.' );
		}

		return this.getNodeStartOffset( node );
	}

	/**
	 * Converts offset in node list to index.
	 *
	 * Returns index of a node that occupies given offset. Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * `model-nodelist-offset-out-of-bounds` if given offset is less than `0` or more than {@link #maxOffset}.
	 *
	 * @param {Number} offset Offset to look for.
	 * @returns {Number} Index of a node that occupies given offset.
	 */
	offsetToIndex( offset ) {
		let totalOffset = 0;

		for ( const node of this._nodes ) {
			if ( offset >= totalOffset && offset < totalOffset + node.offsetSize ) {
				return this.getNodeIndex( node );
			}

			totalOffset += node.offsetSize;
		}

		if ( totalOffset != offset ) {
			/**
			 * Given offset cannot be found in the node list.
			 *
			 * @error nodelist-offset-out-of-bounds
			 */
			throw new CKEditorError( 'model-nodelist-offset-out-of-bounds: Given offset cannot be found in the node list.' );
		}

		return this.length;
	}

	/**
	 * Inserts given nodes at given index.
	 *
	 * @param {Number} index Index at which nodes should be inserted.
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes to be inserted.
	 */
	insertNodes( index, nodes ) {
		// Validation.
		for ( const node of nodes ) {
			if ( !( node instanceof Node ) ) {
				/**
				 * Trying to insert an object which is not a Node instance.
				 *
				 * @error nodelist-insertNodes-not-node
				 */
				throw new CKEditorError( 'model-nodelist-insertNodes-not-node: Trying to insert an object which is not a Node instance.' );
			}
		}

		this._nodes.splice( index, 0, ...nodes );
	}

	/**
	 * Removes one or more nodes starting at the given index.
	 *
	 * @param {Number} indexStart Index of the first node to remove.
	 * @param {Number} [howMany=1] Number of nodes to remove.
	 * @returns {Array.<module:engine/model/node~Node>} Array containing removed nodes.
	 */
	removeNodes( indexStart, howMany = 1 ) {
		return this._nodes.splice( indexStart, howMany );
	}

	/**
	 * Converts `NodeList` instance to an array containing nodes that were inserted in the node list. Nodes
	 * are also converted to their plain object representation.
	 *
	 * @returns {Array.<module:engine/model/node~Node>} `NodeList` instance converted to `Array`.
	 */
	toJSON() {
		return this._nodes.map( node => node.toJSON() );
	}
}
