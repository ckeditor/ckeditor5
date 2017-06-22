/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/basic-transformations
 */

import deltaTransform from './transform';
const addTransformationCase = deltaTransform.addTransformationCase;
const defaultTransform = deltaTransform.defaultTransform;

import Range from '../range';
import Position from '../position';

import NoOperation from '../operation/nooperation';
import AttributeOperation from '../operation/attributeoperation';
import InsertOperation from '../operation/insertoperation';
import ReinsertOperation from '../operation/reinsertoperation';

import Delta from './delta';
import AttributeDelta from './attributedelta';
import InsertDelta from './insertdelta';
import MarkerDelta from './markerdelta';
import MergeDelta from './mergedelta';
import MoveDelta from './movedelta';
import SplitDelta from './splitdelta';
import WeakInsertDelta from './weakinsertdelta';
import WrapDelta from './wrapdelta';
import UnwrapDelta from './unwrapdelta';
import RenameDelta from './renamedelta';
import RemoveDelta from './removedelta';

import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

// Provide transformations for default deltas.

// Add special case for AttributeDelta x WeakInsertDelta transformation.
addTransformationCase( AttributeDelta, WeakInsertDelta, ( a, b, context ) => {
	// If nodes are weak-inserted into attribute delta range, we need to apply changes from attribute delta on them.
	// So first we do the normal transformation and if this special cases happens, we will add an extra delta.
	const deltas = defaultTransform( a, b, context );

	if ( a.range.containsPosition( b.position ) ) {
		deltas.push( _getComplementaryAttrDelta( b, a ) );
	}

	return deltas;
} );

// Add special case for AttributeDelta x SplitDelta transformation.
addTransformationCase( AttributeDelta, SplitDelta, ( a, b, context ) => {
	const splitPosition = new Position( b.position.root, b.position.path.slice( 0, -1 ) );

	const deltas = defaultTransform( a, b, context );

	for ( const operation of a.operations ) {
		// If a node that has been split has it's attribute updated, we should also update attribute of
		// the node created during splitting.
		if ( operation.range.containsPosition( splitPosition ) || operation.range.start.isEqual( splitPosition ) ) {
			const additionalAttributeDelta = new AttributeDelta();

			const rangeStart = splitPosition.getShiftedBy( 1 );
			const rangeEnd = Position.createFromPosition( rangeStart );
			rangeEnd.path.push( 0 );

			const oldValue = b._cloneOperation.nodes.getNode( 0 ).getAttribute( operation.key );

			additionalAttributeDelta.addOperation( new AttributeOperation(
				new Range( rangeStart, rangeEnd ),
				operation.key,
				oldValue === undefined ? null : oldValue,
				operation.newValue,
				0
			) );

			deltas.push( additionalAttributeDelta );

			break;
		}
	}

	return deltas;
} );

// Add special case for InsertDelta x MergeDelta transformation.
addTransformationCase( InsertDelta, MergeDelta, ( a, b, context ) => {
	// If insert is applied at the same position where merge happened, we reverse the merge (we treat it like it
	// didn't happen) and then apply the original insert operation. This is "mirrored" in MergeDelta x InsertDelta
	// transformation below, where we simply do not apply MergeDelta.
	if ( a.position.isEqual( b.position ) ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, context );
} );

function transformMarkerDelta( a, b ) {
	const transformedDelta = a.clone();
	const transformedOp = transformedDelta.operations[ 0 ];

	if ( transformedOp.oldRange ) {
		transformedOp.oldRange = transformedOp.oldRange.getTransformedByDelta( b )[ 0 ];
	}

	if ( transformedOp.newRange ) {
		transformedOp.newRange = transformedOp.newRange.getTransformedByDelta( b )[ 0 ];
	}

	return [ transformedDelta ];
}

addTransformationCase( MarkerDelta, SplitDelta, transformMarkerDelta );
addTransformationCase( MarkerDelta, MergeDelta, transformMarkerDelta );
addTransformationCase( MarkerDelta, WrapDelta, transformMarkerDelta );
addTransformationCase( MarkerDelta, UnwrapDelta, transformMarkerDelta );
addTransformationCase( MarkerDelta, MoveDelta, transformMarkerDelta );
addTransformationCase( MarkerDelta, RenameDelta, transformMarkerDelta );

// Add special case for MoveDelta x MergeDelta transformation.
addTransformationCase( MoveDelta, MergeDelta, ( a, b, context ) => {
	// If move delta is supposed to move a node that has been merged, we reverse the merge (we treat it like it
	// didn't happen) and then apply the original move operation. This is "mirrored" in MergeDelta x MoveDelta
	// transformation below, where we simply do not apply MergeDelta.

	const operateInSameParent =
		a.sourcePosition.root == b.position.root &&
		compareArrays( a.sourcePosition.getParentPath(), b.position.getParentPath() ) === 'same';

	const mergeInsideMoveRange = a.sourcePosition.offset <= b.position.offset && a.sourcePosition.offset + a.howMany > b.position.offset;

	if ( operateInSameParent && mergeInsideMoveRange ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for MergeDelta x InsertDelta transformation.
addTransformationCase( MergeDelta, InsertDelta, ( a, b, context ) => {
	// If merge is applied at the same position where we inserted a range of nodes we cancel the merge as it's results
	// may be unexpected and very weird. Even if we do some "magic" we don't know what really are users' expectations.
	if ( a.position.isEqual( b.position ) ) {
		return [ noDelta() ];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for MergeDelta x MoveDelta transformation.
addTransformationCase( MergeDelta, MoveDelta, ( a, b, context ) => {
	// If merge is applied at the position between moved nodes we cancel the merge as it's results may be unexpected and
	// very weird. Even if we do some "magic" we don't know what really are users' expectations.

	const operateInSameParent =
		a.position.root == b.sourcePosition.root &&
		compareArrays( a.position.getParentPath(), b.sourcePosition.getParentPath() ) === 'same';

	const mergeInsideMoveRange = b.sourcePosition.offset <= a.position.offset && b.sourcePosition.offset + b.howMany > a.position.offset;

	if ( operateInSameParent && mergeInsideMoveRange ) {
		return [ noDelta() ];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for SplitDelta x SplitDelta transformation.
addTransformationCase( SplitDelta, SplitDelta, ( a, b, context ) => {
	const pathA = a.position.getParentPath();
	const pathB = b.position.getParentPath();

	// The special case is for splits inside the same parent.
	if ( a.position.root == b.position.root && compareArrays( pathA, pathB ) == 'same' ) {
		if ( a.position.offset == b.position.offset ) {
			// We are applying split at the position where split already happened. Additional split is not needed.
			return [ noDelta() ];
		} else if ( a.position.offset < b.position.offset ) {
			// Incoming split delta splits at closer offset. So we simply have to once again split the same node,
			// but since it was already split (at further offset) there are less child nodes in the split node.
			// This means that we have to update `howMany` parameter of `MoveOperation` for that delta.

			const delta = a.clone();
			delta._moveOperation.howMany = b.position.offset - a.position.offset;

			// If both SplitDeltas are taking their nodes from graveyard, we have to transform their ReinsertOperations.
			if (
				a._cloneOperation instanceof ReinsertOperation &&
				b._cloneOperation instanceof ReinsertOperation &&
				a._cloneOperation.sourcePosition.offset > b._cloneOperation.sourcePosition.offset
			) {
				delta._cloneOperation.sourcePosition.offset--;
			}

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

			// If both SplitDeltas are taking their nodes from graveyard, we have to transform their ReinsertOperations.
			if (
				a._cloneOperation instanceof ReinsertOperation &&
				b._cloneOperation instanceof ReinsertOperation &&
				a._cloneOperation.sourcePosition.offset > b._cloneOperation.sourcePosition.offset
			) {
				delta._cloneOperation.sourcePosition.offset--;
			}

			return [ delta ];
		}
	}

	return defaultTransform( a, b, context );
} );

// Add special case for SplitDelta x UnwrapDelta transformation.
addTransformationCase( SplitDelta, UnwrapDelta, ( a, b, context ) => {
	// If incoming split delta tries to split a node that just got unwrapped, there is actually nothing to split,
	// so we discard that delta.
	if ( a.position.root == b.position.root && compareArrays( b.position.path, a.position.getParentPath() ) === 'same' ) {
		return [ noDelta() ];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for SplitDelta x WrapDelta transformation.
addTransformationCase( SplitDelta, WrapDelta, ( a, b, context ) => {
	// If split is applied at the position between wrapped nodes, we cancel the split as it's results may be unexpected and
	// very weird. Even if we do some "magic" we don't know what really are users' expectations.

	const sameRoot = a.position.root == b.range.start.root;
	const operateInSameParent = sameRoot && compareArrays( a.position.getParentPath(), b.range.start.getParentPath() ) === 'same';
	const splitInsideWrapRange = b.range.start.offset < a.position.offset && b.range.end.offset >= a.position.offset;

	if ( operateInSameParent && splitInsideWrapRange ) {
		return [ noDelta() ];
	} else if ( sameRoot && compareArrays( a.position.getParentPath(), b.range.end.getShiftedBy( -1 ).path ) === 'same' ) {
		// Split position is directly inside the last node from wrap range.
		// If that's the case, we manually change split delta so it will "target" inside the wrapping element.
		// By doing so we will be inserting split node right to the original node which feels natural and is a good UX.
		const delta = a.clone();

		// 1. Fix insert operation position.
		// Node to split is the last children of the wrapping element.
		// Wrapping element is the element inserted by WrapDelta (re)insert operation.
		// It is inserted after the wrapped range, but the wrapped range will be moved inside it.
		// Having this in mind, it is correct to use wrapped range start position as the position before wrapping element.
		const splitNodePos = Position.createFromPosition( b.range.start );
		// Now, `splitNodePos` points before wrapping element.
		// To get a position before last children of that element, we expand position's `path` member by proper offset.
		splitNodePos.path.push( b.howMany - 1 );

		// SplitDelta insert operation position should be right after the node we split.
		const insertPos = splitNodePos.getShiftedBy( 1 );
		delta._cloneOperation.position = insertPos;

		// 2. Fix move operation source position.
		// Nodes moved by SplitDelta will be moved from new position, modified by WrapDelta.
		// To obtain that new position, `splitNodePos` will be used, as this is the node we are extracting children from.
		const sourcePos = Position.createFromPosition( splitNodePos );
		// Nothing changed inside split node so it is correct to use the original split position offset.
		sourcePos.path.push( a.position.offset );
		delta._moveOperation.sourcePosition = sourcePos;

		// 3. Fix move operation target position.
		// SplitDelta move operation target position should be inside the node inserted by operation above.
		// Since the node is empty, we will insert at offset 0.
		const targetPos = Position.createFromPosition( insertPos );
		targetPos.path.push( 0 );
		delta._moveOperation.targetPosition = targetPos;

		return [ delta ];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for SplitDelta x WrapDelta transformation.
addTransformationCase( SplitDelta, AttributeDelta, ( a, b ) => {
	a = a.clone();

	const splitPosition = new Position( a.position.root, a.position.path.slice( 0, -1 ) );

	if ( a._cloneOperation instanceof InsertOperation ) {
		// If element to split had it's attribute changed, we have to reflect this change in an element
		// that is in SplitDelta's InsertOperation.
		for ( const operation of b.operations ) {
			if ( operation.range.containsPosition( splitPosition ) || operation.range.start.isEqual( splitPosition ) ) {
				if ( operation.newValue !== null ) {
					a._cloneOperation.nodes.getNode( 0 ).setAttribute( operation.key, operation.newValue );
				} else {
					a._cloneOperation.nodes.getNode( 0 ).removeAttribute( operation.key );
				}

				break;
			}
		}
	}

	return [ a ];
} );

// Add special case for UnwrapDelta x SplitDelta transformation.
addTransformationCase( UnwrapDelta, SplitDelta, ( a, b, context ) => {
	// If incoming unwrap delta tries to unwrap node that got split we should unwrap the original node and the split copy.
	// This can be achieved either by reverting split and applying unwrap to singular node, or creating additional unwrap delta.
	if ( a.position.root == b.position.root && compareArrays( a.position.path, b.position.getParentPath() ) === 'same' ) {
		return [
			b.getReversed(),
			a.clone()
		];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for WeakInsertDelta x AttributeDelta transformation.
addTransformationCase( WeakInsertDelta, AttributeDelta, ( a, b ) => {
	// If nodes are weak-inserted into attribute delta range, we need to apply changes from attribute delta on them.
	const deltas = [ a.clone() ];

	if ( b.range.containsPosition( a.position ) ) {
		deltas.push( _getComplementaryAttrDelta( a, b ) );
	}

	return deltas;
} );

// Add special case for WrapDelta x SplitDelta transformation.
addTransformationCase( WrapDelta, SplitDelta, ( a, b, context ) => {
	// If incoming wrap delta tries to wrap range that contains split position, we have to cancel the split and apply
	// the wrap. Since split was already applied, we have to revert it.

	const sameRoot = a.range.start.root == b.position.root;
	const operateInSameParent = sameRoot && compareArrays( a.range.start.getParentPath(), b.position.getParentPath() ) === 'same';
	const splitInsideWrapRange = a.range.start.offset < b.position.offset && a.range.end.offset >= b.position.offset;

	if ( operateInSameParent && splitInsideWrapRange ) {
		return [
			b.getReversed(),
			a.clone()
		];
	} else if ( sameRoot && compareArrays( b.position.getParentPath(), a.range.end.getShiftedBy( -1 ).path ) === 'same' ) {
		const delta = a.clone();

		// Move wrapping element insert position one node further so it is after the split node insertion.
		delta._insertOperation.position.offset++;

		// Include the split node copy.
		delta._moveOperation.howMany++;

		// Change the path to wrapping element in move operation.
		delta._moveOperation.targetPosition.path[ delta._moveOperation.targetPosition.path.length - 2 ]++;

		return [ delta ];
	}

	return defaultTransform( a, b, context );
} );

// Add special case for RenameDelta x SplitDelta transformation.
addTransformationCase( RenameDelta, SplitDelta, ( a, b, context ) => {
	const splitPosition = new Position( b.position.root, b.position.path.slice( 0, -1 ) );

	const deltas = defaultTransform( a, b, context );

	if ( a.operations[ 0 ].position.isEqual( splitPosition ) ) {
		// If a node that has been split has it's name changed, we should also change name of
		// the node created during splitting.
		const additionalRenameDelta = a.clone();
		additionalRenameDelta.operations[ 0 ].position = a.operations[ 0 ].position.getShiftedBy( 1 );

		deltas.push( additionalRenameDelta );
	}

	return deltas;
} );

// Add special case for SplitDelta x RenameDelta transformation.
addTransformationCase( SplitDelta, RenameDelta, ( a, b ) => {
	a = a.clone();

	const splitPosition = new Position( a.position.root, a.position.path.slice( 0, -1 ) );

	if ( a._cloneOperation instanceof InsertOperation ) {
		// If element to split had it's name changed, we have to reflect this change in an element
		// that is in SplitDelta's InsertOperation.
		if ( b.operations[ 0 ].position.isEqual( splitPosition ) ) {
			a._cloneOperation.nodes.getNode( 0 ).name = b.operations[ 0 ].newName;
		}
	}

	return [ a ];
} );

// Add special case for RemoveDelta x SplitDelta transformation.
addTransformationCase( RemoveDelta, SplitDelta, ( a, b, context ) => {
	const deltas = defaultTransform( a, b, context );
	const insertPosition = b._cloneOperation.position;

	// In case if `defaultTransform` returned more than one delta.
	for ( const delta of deltas ) {
		for ( const operation of delta.operations ) {
			const rangeEnd = operation.sourcePosition.getShiftedBy( operation.howMany );

			if ( rangeEnd.isEqual( insertPosition ) ) {
				operation.howMany += 1;
			}
		}
	}

	return deltas;
} );

// Add special case for SplitDelta x RemoveDelta transformation.
addTransformationCase( SplitDelta, RemoveDelta, ( a, b, context ) => {
	b = b.clone();

	const insertPosition = a._cloneOperation.position;

	for ( const operation of b.operations ) {
		const rangeEnd = operation.sourcePosition.getShiftedBy( operation.howMany );

		if ( rangeEnd.isEqual( insertPosition ) ) {
			operation.howMany += 1;
		}
	}

	return defaultTransform( a, b, context );
} );

// Helper function for `AttributeDelta` class transformations.
// Creates an attribute delta that sets attribute from given `attributeDelta` on nodes from given `weakInsertDelta`.
function _getComplementaryAttrDelta( weakInsertDelta, attributeDelta ) {
	const complementaryAttrDelta = new AttributeDelta();
	const nodes = weakInsertDelta.nodes;

	// At the beginning we store the attribute value from the first node on `weakInsertDelta` node list.
	let val = nodes.getNode( 0 ).getAttribute( attributeDelta.key );

	// This stores the last index of `weakInsertDelta` node list where the attribute value was different
	// than in the previous node. We need it to create separate `AttributeOperation`s for nodes with different attributes.
	let lastOffset = 0;
	// Sum of offsets of already processed nodes.
	let offsetSum = nodes.getNode( 0 ).offsetSize;

	for ( let i = 1; i < nodes.length; i++ ) {
		const node = nodes.getNode( i );
		const nodeAttrVal = node.getAttribute( attributeDelta.key );

		// If previous node has different attribute value, we will create an operation to the point before current node.
		// So all nodes with the same attributes up to this point will be included in one `AttributeOperation`.
		if ( nodeAttrVal != val ) {
			// New operation is created only when it is needed. If given node already has proper value for this
			// attribute we simply skip it without adding a new operation.
			if ( val != attributeDelta.value ) {
				addOperation();
			}

			val = nodeAttrVal;
			lastOffset = offsetSum;
		}

		offsetSum = offsetSum + node.offsetSize;
	}

	// At the end we have to add additional `AttributeOperation` for the last part of node list. If all nodes on the
	// node list had same attributes, this will be the only operation added to the delta.
	addOperation();

	return complementaryAttrDelta;

	function addOperation() {
		const range = new Range(
			weakInsertDelta.position.getShiftedBy( lastOffset ),
			weakInsertDelta.position.getShiftedBy( offsetSum )
		);

		const attrOperation = new AttributeOperation( range, attributeDelta.key, val, attributeDelta.value, 0 );
		complementaryAttrDelta.addOperation( attrOperation );
	}
}

// This is "no-op" delta, it has no type and only no-operation, it basically does nothing.
// It is used when we don't want to apply changes but still we need to return a delta.
function noDelta() {
	const noDelta = new Delta();

	// BaseVersion will be fixed later anyway.
	noDelta.addOperation( new NoOperation( 0 ) );

	return noDelta;
}
