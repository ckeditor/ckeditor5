/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import arrayUtils from '../../../lib/lodash/array.js';
import { addTransformationCase, getTransformationCase, defaultTransform } from './transform-api.js';

import Range from '../../range.js';

import AttributeOperation from '../../operation/attributeoperation.js';

import Delta from '../delta.js';
import AttributeDelta from '../attributedelta.js';
import InsertDelta from '../insertdelta.js';
import MergeDelta from '../mergedelta.js';
import MoveDelta from '../movedelta.js';
import SplitDelta from '../splitdelta.js';
import WeakInsertDelta from '../weakinsertdelta.js';
import WrapDelta from '../wrapdelta.js';
import UnwrapDelta from '../unwrapdelta.js';

import utils from '../../../utils.js';

/**
 * @namespace core.treeModel.delta.transform
 */

/**
 * Transforms given {@link core.treeModel.delta.Delta delta} by another {@link core.treeModel.delta.Delta delta} and
 * returns the result of that transformation as an array containing one or more {@link core.treeModel.delta.Delta delta}
 * instances.
 *
 * Delta transformations heavily base on {@link core.treeModel.operation.transform operational transformations}. Since
 * delta is a list of operations most situations can be handled thanks to operational transformation. Unfortunately,
 * deltas are more complicated than operations and have they semantic meaning, as they represent user's editing intentions.
 *
 * Sometimes, simple operational transformation on deltas' operations might result in some unexpected results. Those
 * results would be fine from OT point of view, but would not reflect user's intentions. Because of such conflicts
 * we need to handle transformations in special cases in a custom way.
 *
 * The function itself looks whether two given delta types have a special case function registered. If so, the deltas are
 * transformed using that function. If not, {@link core.treeModel.delta.defaultTransform default transformation algorithm}
 * is used.
 *
 * @see core.treeModel.operation.transform
 *
 * @external core.treeModel.delta.transform
 * @function core.treeModel.delta.transform.transform
 * @param {core.treeModel.delta.Delta} a Delta that will be transformed.
 * @param {core.treeModel.delta.Delta} b Delta to transform by.
 * @param {Boolean} isAMoreImportantThanB Flag indicating whether the delta which will be transformed (`a`) should be treated
 * as more important when resolving conflicts. Note that this flag is used only if provided deltas have same
 * {@link core.treeModel.delta.priorities priority}. If deltas have different priorities, their importance is resolved
 * automatically and overwrites this flag.
 * @returns {Array.<core.treeModel.delta.Delta>} Result of the transformation.
 */
export default function transform( a, b, isAMoreImportantThanB ) {
	const transformAlgorithm = getTransformationCase( a, b ) || defaultTransform;

	const transformed = transformAlgorithm( a, b, isAMoreImportantThanB );
	const baseVersion = arrayUtils.last( b.operations ).baseVersion;

	return updateBaseVersion( baseVersion, transformed );
}

// Updates base versions of operations inside deltas (which are the results of delta transformation).
function updateBaseVersion( baseVersion, deltas ) {
	for ( let delta of deltas ) {
		for ( let op of delta.operations ) {
			op.baseVersion = ++baseVersion;
		}
	}

	return deltas;
}

// Provide transformations for default deltas.

// Add special case for AttributeDelta x WeakInsertDelta transformation.
addTransformationCase( AttributeDelta, WeakInsertDelta, ( a, b, isStrong ) => {
	// If nodes are weak-inserted into attribute delta range, we need to apply changes from attribute delta on them.
	// So first we do the normal transformation and if this special cases happens, we will add an extra delta.
	const deltas = defaultTransform( a, b, isStrong );

	if ( a.range.containsPosition( b.position ) ) {
		deltas.push( _getComplementaryAttrDelta( b, a ) );
	}

	return deltas;
} );

// Add special case for InsertDelta x MergeDelta transformation.
addTransformationCase( InsertDelta, MergeDelta, ( a, b, isStrong ) => {
	// If insert is applied at the same position where merge happened, we reverse the merge (we treat it like it
	// didn't happen) and then apply the original insert operation. This is "mirrored" in MergeDelta x InsertDelta
	// transformation below, where we simply do not apply MergeDelta.
	if ( a.position.isEqual( b.position ) ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for MoveDelta x MergeDelta transformation.
addTransformationCase( MoveDelta, MergeDelta, ( a, b, isStrong ) => {
	// If move delta is supposed to move a node that has been merged, we reverse the merge (we treat it like it
	// didn't happen) and then apply the original move operation. This is "mirrored" in MergeDelta x MoveDelta
	// transformation below, where we simply do not apply MergeDelta.

	const operateInSameParent = utils.compareArrays( a.sourcePosition.getParentPath(), b.position.getParentPath() ) === 'SAME';
	const mergeInsideMoveRange = a.sourcePosition.offset <= b.position.offset && a.sourcePosition.offset + a.howMany > b.position.offset;

	if ( operateInSameParent && mergeInsideMoveRange ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for MergeDelta x InsertDelta transformation.
addTransformationCase( MergeDelta, InsertDelta, ( a, b, isStrong ) => {
	// If merge is applied at the same position where we inserted a range of nodes we cancel the merge as it's results
	// may be unexpected and very weird. Even if we do some "magic" we don't know what really are users' expectations.
	if ( a.position.isEqual( b.position ) ) {
		// This is "no-op" delta, it has no type and no operations, it basically does nothing.
		// It is used when we don't want to apply changes but still we need to return a delta.
		return [ new Delta() ];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for MergeDelta x MoveDelta transformation.
addTransformationCase( MergeDelta, MoveDelta, ( a, b, isStrong ) => {
	// If merge is applied at the position between moved nodes we cancel the merge as it's results may be unexpected and
	// very weird. Even if we do some "magic" we don't know what really are users' expectations.

	const operateInSameParent = utils.compareArrays( a.position.getParentPath(), b.sourcePosition.getParentPath() ) === 'SAME';
	const mergeInsideMoveRange = b.sourcePosition.offset <= a.position.offset && b.sourcePosition.offset + b.howMany > a.position.offset;

	if ( operateInSameParent && mergeInsideMoveRange ) {
		// This is "no-op" delta, it has no type and no operations, it basically does nothing.
		// It is used when we don't want to apply changes but still we need to return a delta.
		return [ new Delta() ];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for SplitDelta x SplitDelta transformation.
addTransformationCase( SplitDelta, SplitDelta, ( a, b, isStrong ) => {
	const pathA = a.position.getParentPath();
	const pathB = b.position.getParentPath();

	// The special case is for splits inside the same parent.
	if ( utils.compareArrays( pathA, pathB ) == 'SAME' ) {
		if ( a.position.offset == b.position.offset ) {
			// We are applying split at the position where split already happened. Additional split is not needed.
			return [ new Delta() ];
		} else if ( a.position.offset < b.position.offset ) {
			// Incoming split delta splits at closer offset. So we simply have to once again split the same node,
			// but since it was already split (at further offset) there are less child nodes in the split node.
			// This means that we have to update `howMany` parameter of `MoveOperation` for that delta.

			const delta = a.clone();
			delta._moveOperation.howMany = b.position.offset - a.position.offset;

			return [ delta ];
		} else {
			// Incoming split delta splits at further offset. We have to simulate that we are not splitting the
			// original split node but the node after it, which got created by the other split delta.
			// To do so, we increment offsets so it looks like the split delta was created in the next node.

			const delta = a.clone();

			delta._cloneOperation.position.offset++;
			delta._moveOperation.sourcePosition.path[ delta._moveOperation.sourcePosition.path.length - 2 ]++;
			delta._moveOperation.targetPosition.path[ delta._moveOperation.targetPosition.path.length - 2 ]++;
			delta._moveOperation.sourcePosition.offset = a.position.offset - b.position.offset;

			return [ delta ];
		}
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for SplitDelta x UnwrapDelta transformation.
addTransformationCase( SplitDelta, UnwrapDelta, ( a, b, isStrong ) => {
	// If incoming split delta tries to split a node that just got unwrapped, there is actually nothing to split,
	// so we discard that delta.
	if ( utils.compareArrays( b.position.path, a.position.getParentPath() ) === 'SAME' ) {
		// This is "no-op" delta, it has no type and no operations, it basically does nothing.
		// It is used when we don't want to apply changes but still we need to return a delta.
		return [ new Delta() ];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for SplitDelta x WrapDelta transformation.
addTransformationCase( SplitDelta, WrapDelta, ( a, b, isStrong ) => {
	// If split is applied at the position between wrapped nodes, we cancel the split as it's results may be unexpected and
	// very weird. Even if we do some "magic" we don't know what really are users' expectations.

	const operateInSameParent = utils.compareArrays( a.position.getParentPath(), b.range.start.getParentPath() ) === 'SAME';
	const splitInsideWrapRange = b.range.start.offset < a.position.offset && b.range.end.offset >= a.position.offset;

	if ( operateInSameParent && splitInsideWrapRange ) {
		// This is "no-op" delta, it has no type and no operations, it basically does nothing.
		// It is used when we don't want to apply changes but still we need to return a delta.
		return [ new Delta() ];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for UnwrapDelta x SplitDelta transformation.
addTransformationCase( UnwrapDelta, SplitDelta, ( a, b, isStrong ) => {
	// If incoming unwrap delta tries to unwrap node that got split we should unwrap the original node and the split copy.
	// This can be achieved either by reverting split and applying unwrap to singular node, or creating additional unwrap delta.
	if ( utils.compareArrays( a.position.path, b.position.getParentPath() ) === 'SAME' ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, isStrong );
} );

// Add special case for WeakInsertDelta x AttributeDelta transformation.
addTransformationCase( WeakInsertDelta, AttributeDelta, ( a, b, isStrong ) => {
	// If nodes are weak-inserted into attribute delta range, we need to apply changes from attribute delta on them.
	// So first we do the normal transformation and if this special cases happens, we will add an extra delta.
	const deltas = defaultTransform( a, b, isStrong );

	if ( b.range.containsPosition( a.position ) ) {
		deltas.push( _getComplementaryAttrDelta( a, b ) );
	}

	return deltas;
} );

// Add special case for WrapDelta x SplitDelta transformation.
addTransformationCase( WrapDelta, SplitDelta, ( a, b, isStrong ) => {
	// If incoming wrap delta tries to wrap range that contains split position, we have to cancel the split and apply
	// the wrap. Since split was already applied, we have to revert it.

	const operateInSameParent = utils.compareArrays( a.range.start.getParentPath(), b.position.getParentPath() ) === 'SAME';
	const splitInsideWrapRange = a.range.start.offset < b.position.offset && a.range.end.offset >= b.position.offset;

	if ( operateInSameParent && splitInsideWrapRange ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, isStrong );
} );

// Helper function for `AttributeDelta` class transformations.
// Creates an attribute delta that sets attribute from given `attributeDelta` on nodes from given `weakInsertDelta`.
function _getComplementaryAttrDelta( weakInsertDelta, attributeDelta ) {
	const complementaryAttrDelta = new AttributeDelta();

	// At the beginning we store the attribute value from the first node on `weakInsertDelta` node list.
	let val = weakInsertDelta.nodeList.get( 0 ).getAttribute( attributeDelta.key );

	// This stores the last index of `weakInsertDelta` node list where the attribute value was different
	// than in the previous node. We need it to create separate `AttributeOperation`s for nodes with different attributes.
	let lastIndex = 0;

	for ( let i = 0; i < weakInsertDelta.nodeList.length; i++ ) {
		const node = weakInsertDelta.nodeList.get( i );
		const nodeAttrVal = node.getAttribute( attributeDelta.key );

		// If previous node has different attribute value, we will create an operation to the point before current node.
		// So all nodes with the same attributes up to this point will be included in one `AttributeOperation`.
		if ( nodeAttrVal != val ) {
			// New operation is created only when it is needed. If given node already has proper value for this
			// attribute we simply skip it without adding a new operation.
			if ( val != attributeDelta.value ) {
				const range = new Range( weakInsertDelta.position.getShiftedBy( lastIndex ), weakInsertDelta.position.getShiftedBy( i ) );

				// We don't care about base version because it will be updated after transformations anyway.
				const attrOperation = new AttributeOperation( range, attributeDelta.key, val, attributeDelta.value, 0 );
				complementaryAttrDelta.addOperation( attrOperation );
			}

			val = nodeAttrVal;
			lastIndex = i;
		}
	}

	// At the end we have to add additional `AttributeOperation` for the last part of node list. If all nodes on the
	// node list had same attributes, this will be the only operation added to the delta.
	const range = new Range(
		weakInsertDelta.position.getShiftedBy( lastIndex ),
		weakInsertDelta.position.getShiftedBy( weakInsertDelta.nodeList.length )
	);

	complementaryAttrDelta.addOperation( new AttributeOperation( range, attributeDelta.key, val, attributeDelta.value, 0 ) );

	return complementaryAttrDelta;
}
