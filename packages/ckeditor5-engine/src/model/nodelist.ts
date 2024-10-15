/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

	private _offsetsBufferSize: number = 10;
	private _offsets: Uint16Array = new Uint16Array( this._offsetsBufferSize );

	/**
	 * Creates an empty node list.
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
		if ( this._nodes.length == 0 ) {
			return 0;
		}

		const lastNode = this._nodes[ this._nodes.length - 1 ];

		return lastNode.endOffset!;
	}

	/**
	 * Gets the node at the given index. Returns `null` if incorrect index was passed.
	 */
	public getNode( index: number ): Node | null {
		return this._nodes[ index ] || null;
	}

	public getNodeAtIndex( index: number ): Node | null {
		return this.getNode( index );
	}

	public getNodeAtOffset( offset: number ): Node | null {
		const index = this._offsets[ offset ];

		return this._nodes[ index ];
	}

	/**
	 * Returns an index of the given node. Returns `null` if given node is not inside this node list.
	 */
	public getNodeIndex( node: Node ): number | null {
		return node.index;
	}

	/**
	 * Returns the starting offset of given node. Starting offset is equal to the sum of
	 * {@link module:engine/model/node~Node#offsetSize offset sizes} of all nodes that are before this node in this node list.
	 */
	public getNodeStartOffset( node: Node ): number | null {
		return node.startOffset;
	}

	/**
	 * Converts index to offset in node list.
	 *
	 * Returns starting offset of a node that is at given index. Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * `model-nodelist-index-out-of-bounds` if given index is less than `0` or more than {@link #length}.
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
	 * Returns index of a node that occupies given offset. Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError}
	 * `model-nodelist-offset-out-of-bounds` if given offset is less than `0` or more than {@link #maxOffset}.
	 */
	public offsetToIndex( offset: number ): number {
		if ( offset == this.maxOffset ) {
			return this._nodes.length;
		}

		if ( offset < 0 || offset > this.maxOffset ) {
			/**
			 * Given offset cannot be found in the node list.
			 *
			 * @error model-nodelist-offset-out-of-bounds
			 * @param offset
			 * @param nodeList Stringified node list.
			 */
			throw new CKEditorError( 'model-nodelist-offset-out-of-bounds',
				this,
				{
					offset,
					nodeList: this
				}
			);
		}

		return this._offsets[ offset ];
	}

	/**
	 * Inserts given nodes at given index.
	 *
	 * @internal
	 * @param index Index at which nodes should be inserted.
	 * @param nodes Nodes to be inserted.
	 */
	public _insertNodes( index: number, nodes: Iterable<Node> ): void {
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
		}

		const startOffset = index == 0 ? 0 : this._nodes[ index - 1 ].endOffset!;
		let offset = startOffset;

		this._nodes = spliceArray<Node>( this._nodes, Array.from( nodes ), index, 0 );

		for ( let i = index; i < this._nodes.length; i++ ) {
			this._nodes[ i ]._index = i;
			this._nodes[ i ]._startOffset = offset;

			offset += this._nodes[ i ].offsetSize;
		}

		const maxOffset = this.maxOffset;

		if ( maxOffset >= this._offsetsBufferSize ) {
			this._offsetsBufferSize = maxOffset + 500;

			// Resize buffer to `this._offsetBufferSize`.
			const newOffsets = new Uint16Array( this._offsetsBufferSize );
			newOffsets.set( this._offsets );

			this._offsets = newOffsets;
		}

		for ( let i = index; i < this._nodes.length; i++ ) {
			this._offsets.fill( i, this._nodes[ i ].startOffset!, this._nodes[ i ].endOffset! );
		}
	}

	private _makeOffsetsArray( nodes: Array<Node> ): Array<Node> {
		const offsets: Array<Node> = [];

		for ( const node of nodes ) {
			const nodeOffsets = Array( node.offsetSize );
			nodeOffsets.fill( node );

			offsets.splice( offsets.length, 0, ...nodeOffsets );
		}

		return offsets;
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

		let offset = this.indexToOffset( indexStart );
		const nodes = this._nodes.splice( indexStart, howMany );

		nodes.forEach( node => {
			node._index = null;
			node._startOffset = null;
		} );

		for ( let i = indexStart; i < this._nodes.length; i++ ) {
			this._nodes[ i ]._index = i;
			this._nodes[ i ]._startOffset = offset;

			offset += this._nodes[ i ].offsetSize;
		}

		for ( let i = indexStart; i < this._nodes.length; i++ ) {
			this._offsets.fill( i, this._nodes[ i ].startOffset!, this._nodes[ i ].endOffset! );
		}

		return nodes;
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
