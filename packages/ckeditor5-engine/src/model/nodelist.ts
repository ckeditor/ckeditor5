/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/nodelist
 */

import Node from './node.js';

import { CKEditorError, spliceArray } from '@ckeditor/ckeditor5-utils';

/**
 * Provides an interface to operate on a list of {@link module:engine/model/node~Node nodes}. `NodeList` is used internally
 * in classes like {@link module:engine/model/element~Element Element}
 * or {@link module:engine/model/documentfragment~DocumentFragment DocumentFragment}.
 */
export default class NodeList implements Iterable<Node> {
	/**
	 * Nodes contained in this node list.
	 */
	private _nodes: Array<Node> = [];

	/**
	 * This array maps numbers (offsets) to node that is placed at that offset.
	 *
	 * This array is similar to `_nodes` with the difference that one node may occupy multiple consecutive items in the array.
	 *
	 * This array is needed to quickly retrieve a node that is placed at given offset.
	 */
	private _offsetToNode: Array<Node> = [];

	/**
	 * Creates a node list.
	 *
	 * @internal
	 * @param nodes Nodes contained in this node list.
	 */
	constructor( nodes?: Iterable<Node> ) {
		if ( nodes ) {
			this._insertNodes( 0, nodes );
		}
	}

	/**
	 * Iterable interface.
	 *
	 * Iterates over all nodes contained inside this node list.
	 */
	public [ Symbol.iterator ](): IterableIterator<Node> {
		return this._nodes[ Symbol.iterator ]();
	}

	/**
	 * Number of nodes contained inside this node list.
	 */
	public get length(): number {
		return this._nodes.length;
	}

	/**
	 * Sum of {@link module:engine/model/node~Node#offsetSize offset sizes} of all nodes contained inside this node list.
	 */
	public get maxOffset(): number {
		return this._offsetToNode.length;
	}

	/**
	 * Gets the node at the given index. Returns `null` if incorrect index was passed.
	 */
	public getNode( index: number ): Node | null {
		return this._nodes[ index ] || null;
	}

	/**
	 * Gets the node at the given offset. Returns `null` if incorrect offset was passed.
	 */
	public getNodeAtOffset( offset: number ): Node | null {
		return this._offsetToNode[ offset ] || null;
	}

	/**
	 * Returns an index of the given node or `null` if given node does not have a parent.
	 *
	 * This is an alias to {@link module:engine/model/node~Node#index}.
	 */
	public getNodeIndex( node: Node ): number | null {
		return node.index;
	}

	/**
	 * Returns the offset at which given node is placed in its parent or `null` if given node does not have a parent.
	 *
	 * This is an alias to {@link module:engine/model/node~Node#startOffset}.
	 */
	public getNodeStartOffset( node: Node ): number | null {
		return node.startOffset;
	}

	/**
	 * Converts index to offset in node list.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `model-nodelist-index-out-of-bounds` if given index is less
	 * than `0` or more than {@link #length}.
	 */
	public indexToOffset( index: number ): number {
		if ( index == this._nodes.length ) {
			return this.maxOffset;
		}

		const node = this._nodes[ index ];

		if ( !node ) {
			/**
			 * Given index cannot be found in the node list.
			 *
			 * @error model-nodelist-index-out-of-bounds
			 */
			throw new CKEditorError( 'model-nodelist-index-out-of-bounds', this );
		}

		return this.getNodeStartOffset( node )!;
	}

	/**
	 * Converts offset in node list to index.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `model-nodelist-offset-out-of-bounds` if given offset is less
	 * than `0` or more than {@link #maxOffset}.
	 */
	public offsetToIndex( offset: number ): number {
		if ( offset == this._offsetToNode.length ) {
			return this._nodes.length;
		}

		const node = this._offsetToNode[ offset ];

		if ( !node ) {
			/**
			 * Given offset cannot be found in the node list.
			 *
			 * @error model-nodelist-offset-out-of-bounds
			 * @param {number} offset The offset value.
			 * @param {module:engine/model/nodelist~NodeList} nodeList Stringified node list.
			 */
			throw new CKEditorError( 'model-nodelist-offset-out-of-bounds',
				this,
				{
					offset,
					nodeList: this
				}
			);
		}

		return this.getNodeIndex( node )!;
	}

	/**
	 * Inserts given nodes at given index.
	 *
	 * @internal
	 * @param index Index at which nodes should be inserted.
	 * @param nodes Nodes to be inserted.
	 */
	public _insertNodes( index: number, nodes: Iterable<Node> ): void {
		const nodesArray: Array<Node> = [];

		// Validation.
		for ( const node of nodes ) {
			if ( !( node instanceof Node ) ) {
				/**
				 * Trying to insert an object which is not a Node instance.
				 *
				 * @error model-nodelist-insertnodes-not-node
				 */
				throw new CKEditorError( 'model-nodelist-insertnodes-not-node', this );
			}

			nodesArray.push( node );
		}

		let offset = this.indexToOffset( index );

		// Splice nodes array and offsets array into the nodelist.
		spliceArray( this._nodes, nodesArray, index );
		spliceArray( this._offsetToNode, makeOffsetsArray( nodesArray ), offset );

		// Refresh indexes and offsets for nodes inside this node list. We need to do this for all inserted nodes and all nodes after them.
		for ( let i = index; i < this._nodes.length; i++ ) {
			this._nodes[ i ]._index = i;
			this._nodes[ i ]._startOffset = offset;

			offset += this._nodes[ i ].offsetSize;
		}
	}

	/**
	 * Removes one or more nodes starting at the given index.
	 *
	 * @internal
	 * @param indexStart Index of the first node to remove.
	 * @param howMany Number of nodes to remove.
	 * @returns Array containing removed nodes.
	 */
	public _removeNodes( indexStart: number, howMany: number = 1 ): Array<Node> {
		if ( howMany == 0 ) {
			return [];
		}

		// Remove nodes from this nodelist.
		let offset = this.indexToOffset( indexStart );
		const nodes = this._nodes.splice( indexStart, howMany );
		const lastNode = nodes[ nodes.length - 1 ];
		const removedOffsetSum = lastNode.startOffset! + lastNode.offsetSize - offset;
		this._offsetToNode.splice( offset, removedOffsetSum );

		// Reset index and start offset properties for the removed nodes -- they do not have a parent anymore.
		for ( const node of nodes ) {
			node._index = null;
			node._startOffset = null;
		}

		for ( let i = indexStart; i < this._nodes.length; i++ ) {
			this._nodes[ i ]._index = i;
			this._nodes[ i ]._startOffset = offset;

			offset += this._nodes[ i ].offsetSize;
		}

		return nodes;
	}

	/**
	 * Removes children nodes provided as an array. These nodes do not need to be direct siblings.
	 *
	 * This method is faster than removing nodes one by one, as it recalculates offsets only once.
	 *
	 * @internal
	 * @param nodes Array of nodes.
	 */
	public _removeNodesArray( nodes: Array<Node> ): void {
		if ( nodes.length == 0 ) {
			return;
		}

		for ( const node of nodes ) {
			node._index = null;
			node._startOffset = null;
		}

		this._nodes = this._nodes.filter( node => node.index !== null );
		this._offsetToNode = this._offsetToNode.filter( node => node.index !== null );

		let offset = 0;

		for ( let i = 0; i < this._nodes.length; i++ ) {
			this._nodes[ i ]._index = i;
			this._nodes[ i ]._startOffset = offset;

			offset += this._nodes[ i ].offsetSize;
		}
	}

	/**
	 * Converts `NodeList` instance to an array containing nodes that were inserted in the node list. Nodes
	 * are also converted to their plain object representation.
	 *
	 * @returns `NodeList` instance converted to `Array`.
	 */
	public toJSON(): unknown {
		return this._nodes.map( node => node.toJSON() );
	}
}

/**
 * Creates an array of nodes in the format as in {@link module:engine/model/nodelist~NodeList#_offsetToNode}, i.e. one node will
 * occupy multiple items if its offset size is greater than one.
 */
function makeOffsetsArray( nodes: Array<Node> ): Array<Node> {
	const offsets = [];
	let index = 0;

	for ( const node of nodes ) {
		for ( let i = 0; i < node.offsetSize; i++ ) {
			offsets[ index++ ] = node;
		}
	}

	return offsets;
}
