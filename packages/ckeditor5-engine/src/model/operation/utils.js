/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/utils
 */

import Node from '../node';
import Text from '../text';
import TextProxy from '../textproxy';
import Range from '../range';
import DocumentFragment from '../documentfragment';
import NodeList from '../nodelist';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Contains functions used for composing model tree by {@link module:engine/model/operation/operation~Operation operations}.
 * Those functions are built on top of {@link module:engine/model/node~Node node}, and it's child classes', APIs.
 *
 * @protected
 * @namespace utils
 */

/**
 * Inserts given nodes at given position.
 *
 * @protected
 * @function module:engine/model/operation/utils~utils.insert
 * @param {module:engine/model/position~Position} position Position at which nodes should be inserted.
 * @param {module:engine/model/node~NodeSet} nodes Nodes to insert.
 * @returns {module:engine/model/range~Range} Range spanning over inserted elements.
 */
export function _insert( position, nodes ) {
	nodes = _normalizeNodes( nodes );

	// We have to count offset before inserting nodes because they can get merged and we would get wrong offsets.
	const offset = nodes.reduce( ( sum, node ) => sum + node.offsetSize, 0 );
	const parent = position.parent;

	// Insertion might be in a text node, we should split it if that's the case.
	_splitNodeAtPosition( position );
	const index = position.index;

	// Insert nodes at given index. After splitting we have a proper index and insertion is between nodes,
	// using basic `Element` API.
	parent._insertChild( index, nodes );

	// Merge text nodes, if possible. Merging is needed only at points where inserted nodes "touch" "old" nodes.
	_mergeNodesAtIndex( parent, index + nodes.length );
	_mergeNodesAtIndex( parent, index );

	return new Range( position, position.getShiftedBy( offset ) );
}

/**
 * Removed nodes in given range. Only {@link module:engine/model/range~Range#isFlat flat} ranges are accepted.
 *
 * @protected
 * @function module:engine/model/operation/utils~utils._remove
 * @param {module:engine/model/range~Range} range Range containing nodes to remove.
 * @returns {Array.<module:engine/model/node~Node>}
 */
export function _remove( range ) {
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
 * Moves nodes in given range to given target position. Only {@link module:engine/model/range~Range#isFlat flat} ranges are accepted.
 *
 * @protected
 * @function module:engine/model/operation/utils~utils.move
 * @param {module:engine/model/range~Range} sourceRange Range containing nodes to move.
 * @param {module:engine/model/position~Position} targetPosition Position to which nodes should be moved.
 * @returns {module:engine/model/range~Range} Range containing moved nodes.
 */
export function _move( sourceRange, targetPosition ) {
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
	targetPosition = targetPosition._getTransformedByDeletion( sourceRange.start, sourceRange.end.offset - sourceRange.start.offset );

	return _insert( targetPosition, nodes );
}

/**
 * Sets given attribute on nodes in given range. The attributes are only set on top-level nodes of the range, not on its children.
 *
 * @protected
 * @function module:engine/model/operation/utils~utils._setAttribute
 * @param {module:engine/model/range~Range} range Range containing nodes that should have the attribute set. Must be a flat range.
 * @param {String} key Key of attribute to set.
 * @param {*} value Attribute value.
 */
export function _setAttribute( range, key, value ) {
	// Range might start or end in text nodes, so we have to split them.
	_splitNodeAtPosition( range.start );
	_splitNodeAtPosition( range.end );

	// Iterate over all items in the range.
	for ( const item of range.getItems( { shallow: true } ) ) {
		// Iterator will return `TextProxy` instances but we know that those text proxies will
		// always represent full text nodes (this is guaranteed thanks to splitting we did before).
		// So, we can operate on those text proxies' text nodes.
		const node = item.is( '$textProxy' ) ? item.textNode : item;

		if ( value !== null ) {
			node._setAttribute( key, value );
		} else {
			node._removeAttribute( key );
		}

		// After attributes changing it may happen that some text nodes can be merged. Try to merge with previous node.
		_mergeNodesAtIndex( node.parent, node.index );
	}

	// Try to merge last changed node with it's previous sibling (not covered by the loop above).
	_mergeNodesAtIndex( range.end.parent, range.end.index );
}

/**
 * Normalizes given object or an array of objects to an array of {@link module:engine/model/node~Node nodes}. See
 * {@link module:engine/model/node~NodeSet NodeSet} for details on how normalization is performed.
 *
 * @protected
 * @function module:engine/model/operation/utils~utils.normalizeNodes
 * @param {module:engine/model/node~NodeSet} nodes Objects to normalize.
 * @returns {Array.<module:engine/model/node~Node>} Normalized nodes.
 */
export function _normalizeNodes( nodes ) {
	const normalized = [];

	if ( !( nodes instanceof Array ) ) {
		nodes = [ nodes ];
	}

	// Convert instances of classes other than Node.
	for ( let i = 0; i < nodes.length; i++ ) {
		if ( typeof nodes[ i ] == 'string' ) {
			normalized.push( new Text( nodes[ i ] ) );
		} else if ( nodes[ i ] instanceof TextProxy ) {
			normalized.push( new Text( nodes[ i ].data, nodes[ i ].getAttributes() ) );
		} else if ( nodes[ i ] instanceof DocumentFragment || nodes[ i ] instanceof NodeList ) {
			for ( const child of nodes[ i ] ) {
				normalized.push( child );
			}
		} else if ( nodes[ i ] instanceof Node ) {
			normalized.push( nodes[ i ] );
		}
		// Skip unrecognized type.
	}

	// Merge text nodes.
	for ( let i = 1; i < normalized.length; i++ ) {
		const node = normalized[ i ];
		const prev = normalized[ i - 1 ];

		if ( node instanceof Text && prev instanceof Text && _haveSameAttributes( node, prev ) ) {
			// Doing this instead changing `prev.data` because `data` is readonly.
			normalized.splice( i - 1, 2, new Text( prev.data + node.data, prev.getAttributes() ) );
			i--;
		}
	}

	return normalized;
}

// Checks if nodes before and after given index in given element are {@link module:engine/model/text~Text text nodes} and
// merges them into one node if they have same attributes.
//
// Merging is done by removing two text nodes and inserting a new text node containing data from both merged text nodes.
//
// @private
// @param {module:engine/model/element~Element} element Parent element of nodes to merge.
// @param {Number} index Index between nodes to merge.
function _mergeNodesAtIndex( element, index ) {
	const nodeBefore = element.getChild( index - 1 );
	const nodeAfter = element.getChild( index );

	// Check if both of those nodes are text objects with same attributes.
	if ( nodeBefore && nodeAfter && nodeBefore.is( '$text' ) && nodeAfter.is( '$text' ) && _haveSameAttributes( nodeBefore, nodeAfter ) ) {
		// Append text of text node after index to the before one.
		const mergedNode = new Text( nodeBefore.data + nodeAfter.data, nodeBefore.getAttributes() );

		// Remove separate text nodes.
		element._removeChildren( index - 1, 2 );

		// Insert merged text node.
		element._insertChild( index - 1, mergedNode );
	}
}

// Checks if given position is in a text node, and if so, splits the text node in two text nodes, each of them
// containing a part of original text node.
//
// @private
// @param {module:engine/model/position~Position} position Position at which node should be split.
function _splitNodeAtPosition( position ) {
	const textNode = position.textNode;
	const element = position.parent;

	if ( textNode ) {
		const offsetDiff = position.offset - textNode.startOffset;
		const index = textNode.index;

		element._removeChildren( index, 1 );

		const firstPart = new Text( textNode.data.substr( 0, offsetDiff ), textNode.getAttributes() );
		const secondPart = new Text( textNode.data.substr( offsetDiff ), textNode.getAttributes() );

		element._insertChild( index, [ firstPart, secondPart ] );
	}
}

// Checks whether two given nodes have same attributes.
//
// @private
// @param {module:engine/model/node~Node} nodeA Node to check.
// @param {module:engine/model/node~Node} nodeB Node to check.
// @returns {Boolean} `true` if nodes have same attributes, `false` otherwise.
function _haveSameAttributes( nodeA, nodeB ) {
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
 * Value that can be normalized to an array of {@link module:engine/model/node~Node nodes}.
 *
 * Non-arrays are normalized as follows:
 * * {@link module:engine/model/node~Node Node} is left as is,
 * * {@link module:engine/model/textproxy~TextProxy TextProxy} and `String` are normalized to {@link module:engine/model/text~Text Text},
 * * {@link module:engine/model/nodelist~NodeList NodeList} is normalized to an array containing all nodes that are in that node list,
 * * {@link module:engine/model/documentfragment~DocumentFragment DocumentFragment} is normalized to an array containing all of it's
 * * children.
 *
 * Arrays are processed item by item like non-array values and flattened to one array. Normalization always results in
 * a flat array of {@link module:engine/model/node~Node nodes}. Consecutive text nodes (or items normalized to text nodes) will be
 * merged if they have same attributes.
 *
 * @typedef {module:engine/model/node~Node|module:engine/model/textproxy~TextProxy|String|
 * module:engine/model/nodelist~NodeList|module:engine/model/documentfragment~DocumentFragment|Iterable}
 * module:engine/model/node~NodeSet
 */
