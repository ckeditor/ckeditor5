/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/utils
 */

import { ModelNode } from '../node.js';
import { ModelRange } from '../range.js';
import { ModelText } from '../text.js';
import { ModelTextProxy } from '../textproxy.js';

import { type ModelDocumentFragment } from '../documentfragment.js';
import { type ModelElement } from '../element.js';
import { type ModelItem } from '../item.js';
import { type ModelNodeList } from '../nodelist.js';
import { type ModelPosition } from '../position.js';

import { CKEditorError, isIterable } from '@ckeditor/ckeditor5-utils';

/**
 * Inserts given nodes at given position.
 *
 * @internal
 * @param position Position at which nodes should be inserted.
 * @param nodes Nodes to insert.
 * @returns Range spanning over inserted elements.
 */
export function _insert( position: ModelPosition, nodes: ModelNodeSet ): ModelRange {
	const normalizedNodes = _normalizeNodes( nodes );

	// We have to count offset before inserting nodes because they can get merged and we would get wrong offsets.
	const offset = normalizedNodes.reduce( ( sum, node ) => sum + node.offsetSize, 0 );
	const parent = position.parent;

	// Insertion might be in a text node, we should split it if that's the case.
	_splitNodeAtPosition( position );
	const index = position.index;

	// Insert nodes at given index. After splitting we have a proper index and insertion is between nodes,
	// using basic `Element` API.
	parent._insertChild( index, normalizedNodes );

	// Merge text nodes, if possible. Merging is needed only at points where inserted nodes "touch" "old" nodes.
	_mergeNodesAtIndex( parent, index + normalizedNodes.length );
	_mergeNodesAtIndex( parent, index );

	return new ModelRange( position, position.getShiftedBy( offset ) );
}

/**
 * Removed nodes in given range. Only {@link module:engine/model/range~ModelRange#isFlat flat} ranges are accepted.
 *
 * @internal
 * @param range Range containing nodes to remove.
 */
export function _remove( this: any, range: ModelRange ): Array<ModelNode> {
	if ( !range.isFlat ) {
		/**
		 * Trying to remove a range which starts and ends in different element.
		 *
		 * @error operation-utils-remove-range-not-flat
		 */
		throw new CKEditorError(
			'operation-utils-remove-range-not-flat',
			this
		);
	}

	const parent = range.start.parent;

	// Range may be inside text nodes, we have to split them if that's the case.
	_splitNodeAtPosition( range.start );
	_splitNodeAtPosition( range.end );

	// Remove the text nodes using basic `Element` API.
	const removed = parent._removeChildren( range.start.index, range.end.index - range.start.index );

	// Merge text nodes, if possible. After some nodes were removed, node before and after removed range will be
	// touching at the position equal to the removed range beginning. We check merging possibility there.
	_mergeNodesAtIndex( parent, range.start.index );

	return removed;
}

/**
 * Moves nodes in given range to given target position. Only {@link module:engine/model/range~ModelRange#isFlat flat} ranges are accepted.
 *
 * @internal
 * @param sourceRange Range containing nodes to move.
 * @param targetPosition Position to which nodes should be moved.
 * @returns Range containing moved nodes.
 */
export function _move( this: any, sourceRange: ModelRange, targetPosition: ModelPosition ): ModelRange {
	if ( !sourceRange.isFlat ) {
		/**
		 * Trying to move a range which starts and ends in different element.
		 *
		 * @error operation-utils-move-range-not-flat
		 */
		throw new CKEditorError(
			'operation-utils-move-range-not-flat',
			this
		);
	}

	const nodes = _remove( sourceRange );

	// We have to fix `targetPosition` because model changed after nodes from `sourceRange` got removed and
	// that change might have an impact on `targetPosition`.
	targetPosition = targetPosition._getTransformedByDeletion( sourceRange.start, sourceRange.end.offset - sourceRange.start.offset )!;

	return _insert( targetPosition, nodes );
}

/**
 * Sets given attribute on nodes in given range. The attributes are only set on top-level nodes of the range, not on its children.
 *
 * @internal
 * @param range Range containing nodes that should have the attribute set. Must be a flat range.
 * @param key Key of attribute to set.
 * @param value Attribute value.
 */
export function _setAttribute( range: ModelRange, key: string, value: unknown ): void {
	// Range might start or end in text nodes, so we have to split them.
	_splitNodeAtPosition( range.start );
	_splitNodeAtPosition( range.end );

	// Iterate over all items in the range.
	for ( const item of range.getItems( { shallow: true } ) ) {
		// Iterator will return `ModelTextProxy` instances but we know that those text proxies will
		// always represent full text nodes (this is guaranteed thanks to splitting we did before).
		// So, we can operate on those text proxies' text nodes.
		const node = item.is( '$textProxy' ) ? item.textNode : item;

		if ( value !== null ) {
			node._setAttribute( key, value );
		} else {
			node._removeAttribute( key );
		}

		// After attributes changing it may happen that some text nodes can be merged. Try to merge with previous node.
		_mergeNodesAtIndex( node.parent!, node.index! );
	}

	// Try to merge last changed node with it's previous sibling (not covered by the loop above).
	_mergeNodesAtIndex( range.end.parent, range.end.index );
}

/**
 * Normalizes given object or an array of objects to an array of {@link module:engine/model/node~ModelNode nodes}. See
 * {@link ~ModelNodeSet NodeSet} for details on how normalization is performed.
 *
 * @internal
 * @param nodes Objects to normalize.
 * @returns Normalized nodes.
 */
export function _normalizeNodes( nodes: ModelNodeSet ): Array<ModelNode> {
	const normalized: Array<ModelNode> = [];

	function convert( nodes: ModelNodeSet ) {
		if ( typeof nodes == 'string' ) {
			normalized.push( new ModelText( nodes ) );
		} else if ( nodes instanceof ModelTextProxy ) {
			normalized.push( new ModelText( nodes.data, nodes.getAttributes() ) );
		} else if ( nodes instanceof ModelNode ) {
			normalized.push( nodes );
		} else if ( isIterable( nodes ) ) {
			for ( const node of nodes ) {
				convert( node );
			}
		} else {
			// Skip unrecognized type.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const unreachable: never = nodes;
		}
	}

	convert( nodes );

	// Merge text nodes.
	for ( let i = 1; i < normalized.length; i++ ) {
		const node = normalized[ i ];
		const prev = normalized[ i - 1 ];

		if ( node instanceof ModelText && prev instanceof ModelText && _haveSameAttributes( node, prev ) ) {
			// Doing this instead changing `prev.data` because `data` is readonly.
			normalized.splice( i - 1, 2, new ModelText( prev.data + node.data, prev.getAttributes() ) );
			i--;
		}
	}

	return normalized;
}

/**
 * Checks if nodes before and after given index in given element are {@link module:engine/model/text~ModelText text nodes} and
 * merges them into one node if they have same attributes.
 *
 * Merging is done by removing two text nodes and inserting a new text node containing data from both merged text nodes.
 *
 * @param element Parent element of nodes to merge.
 * @param index Index between nodes to merge.
 */
function _mergeNodesAtIndex( element: ModelElement | ModelDocumentFragment, index: number ) {
	const nodeBefore = element.getChild( index - 1 );
	const nodeAfter = element.getChild( index );

	// Check if both of those nodes are text objects with same attributes.
	if ( nodeBefore && nodeAfter && nodeBefore.is( '$text' ) && nodeAfter.is( '$text' ) && _haveSameAttributes( nodeBefore, nodeAfter ) ) {
		// Append text of text node after index to the before one.
		const mergedNode = new ModelText( nodeBefore.data + nodeAfter.data, nodeBefore.getAttributes() );

		// Remove separate text nodes.
		element._removeChildren( index - 1, 2 );

		// Insert merged text node.
		element._insertChild( index - 1, mergedNode );
	}
}

/**
 * Checks if given position is in a text node, and if so, splits the text node in two text nodes, each of them
 * containing a part of original text node.
 *
 * @param position Position at which node should be split.
 */
function _splitNodeAtPosition( position: ModelPosition ): void {
	const textNode = position.textNode;
	const element = position.parent;

	if ( textNode ) {
		const offsetDiff = position.offset - textNode.startOffset!;
		const index = textNode.index!;

		element._removeChildren( index, 1 );

		const firstPart = new ModelText( textNode.data.substr( 0, offsetDiff ), textNode.getAttributes() );
		const secondPart = new ModelText( textNode.data.substr( offsetDiff ), textNode.getAttributes() );

		element._insertChild( index, [ firstPart, secondPart ] );
	}
}

/**
 * Checks whether two given nodes have same attributes.
 *
 * @param nodeA Node to check.
 * @param nodeB Node to check.
 * @returns `true` if nodes have same attributes, `false` otherwise.
 */
function _haveSameAttributes( nodeA: ModelNode, nodeB: ModelNode ): boolean | undefined {
	const iteratorA = nodeA.getAttributes();
	const iteratorB = nodeB.getAttributes();

	for ( const attr of iteratorA ) {
		if ( attr[ 1 ] !== nodeB.getAttribute( attr[ 0 ] ) ) {
			return false;
		}

		iteratorB.next();
	}

	return iteratorB.next().done;
}

/**
 * Value that can be normalized to an array of {@link module:engine/model/node~ModelNode nodes}.
 *
 * Non-arrays are normalized as follows:
 * * {@link module:engine/model/node~ModelNode Node} is left as is,
 * * {@link module:engine/model/textproxy~ModelTextProxy TextProxy} and `string` are normalized to
 * {@link module:engine/model/text~ModelText Text},
 * * {@link module:engine/model/nodelist~ModelNodeList NodeList} is normalized to an array containing all nodes that are in that node list,
 * * {@link module:engine/model/documentfragment~ModelDocumentFragment ModelDocumentFragment} is normalized to an array containing all of
 * it's children.
 *
 * Arrays are processed item by item like non-array values and flattened to one array. Normalization always results in
 * a flat array of {@link module:engine/model/node~ModelNode nodes}. Consecutive text nodes (or items normalized to text nodes) will be
 * merged if they have same attributes.
 */
export type ModelNodeSet =
	| ModelItem
	| string
	| ModelNodeList
	| ModelDocumentFragment
	| Iterable<ModelItem
	| string
	| ModelNodeList
	| ModelDocumentFragment>;
