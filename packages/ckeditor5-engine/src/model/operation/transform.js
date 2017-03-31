/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/transform
 */

import InsertOperation from './insertoperation';
import AttributeOperation from './attributeoperation';
import RootAttributeOperation from './rootattributeoperation';
import RenameOperation from './renameoperation';
import MarkerOperation from './markeroperation';
import MoveOperation from './moveoperation';
import RemoveOperation from './removeoperation';
import NoOperation from './nooperation';
import Range from '../range';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';

/**
 * Transforms given {@link module:engine/model/operation/operation~Operation operation}
 * by another {@link module:engine/model/operation/operation~Operation operation}
 * and returns the result of that transformation as an array containing
 * one or more {@link module:engine/model/operation/operation~Operation operations}.
 *
 * Operations work on specified positions, passed to them when they are created.
 * Whenever {@link module:engine/model/document~Document document}
 * changes, we have to reflect those modifications by updating or "transforming" operations which are not yet applied.
 * When an operation is transformed, its parameters may change based on the operation by which it is transformed.
 * If the transform-by operation applied any modifications to the Tree Data Model which affect positions or nodes
 * connected with transformed operation, those changes will be reflected in the parameters of the returned operation(s).
 *
 * Whenever the {@link module:engine/model/document~Document document}
 * has different {@link module:engine/model/document~Document#version}
 * than the operation you want to {@link module:engine/model/document~Document#applyOperation apply}, you need to transform that
 * operation by all operations which were already applied to the {@link module:engine/model/document~Document document} and have greater
 * {@link module:engine/model/document~Document#version} than the operation being applied. Transform them in the same order as those
 * operations which were applied. This way all modifications done to the Tree Data Model will be reflected
 * in the operation parameters and the operation will "operate" on "up-to-date" version of the Tree Data Model.
 * This is mostly the case with Operational Transformations but it might be needed in particular features as well.
 *
 * In some cases, when given operation apply changes to the same nodes as this operation, two or more operations need
 * to be created as one would not be able to reflect the combination of these operations.
 * This is why an array is returned instead of a single object. All returned operations have to be applied
 * (or further transformed) to get an effect which was intended in pre-transformed operation.
 *
 * Sometimes two operations are in conflict. This happens when they modify the same node in a different way, i.e.
 * set different value for the same attribute or move the node into different positions. When this happens,
 * we need to decide which operation is more important. We can't assume that operation `a` or operation `b` is always
 * more important. In Operational Transformations algorithms we often need to get a result of transforming
 * `a` by `b` and also `b` by `a`. In both transformations the same operation has to be the important one. If we assume
 * that first or the second passed operation is always more important we won't be able to solve this case.
 *
 * @external module:engine/model/model.operation
 * @function module:engine/model/operation/transform~transform
 * @param {module:engine/model/operation/operation~Operation} a Operation that will be transformed.
 * @param {module:engine/model/operation/operation~Operation} b Operation to transform by.
 * @param {Boolean} isAMoreImportantThanB Flag indicating whether the operation which will be transformed (`a`) should be treated
 * as more important when resolving conflicts.
 * @returns {Array.<module:engine/model/operation/operation~Operation>} Result of the transformation.
 */

export default transform;

const ot = {
	InsertOperation: {
		// Transforms InsertOperation `a` by InsertOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		InsertOperation( a, b, isStrong ) {
			// Transformed operations are always new instances, not references to the original operations.
			const transformed = a.clone();

			// Transform insert position by the other operation position.
			transformed.position = transformed.position._getTransformedByInsertion( b.position, b.nodes.maxOffset, !isStrong );

			return [ transformed ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		// Transforms InsertOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		MoveOperation( a, b, isStrong ) {
			const transformed = a.clone();

			// Transform insert position by the other operation parameters.
			transformed.position = a.position._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, !isStrong, b.isSticky );

			return [ transformed ];
		}
	},

	AttributeOperation: {
		// Transforms AttributeOperation `a` by InsertOperation `b`. Returns results as an array of operations.
		InsertOperation( a, b ) {
			// Transform this operation's range.
			const ranges = a.range._getTransformedByInsertion( b.position, b.nodes.maxOffset, true, false );

			// Map transformed range(s) to operations and return them.
			return ranges.reverse().map( ( range ) => {
				return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
			} );
		},

		// Transforms AttributeOperation `a` by AttributeOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		AttributeOperation( a, b, isStrong ) {
			if ( a.key === b.key ) {
				// If operations attributes are in conflict, check if their ranges intersect and manage them properly.

				// First, we want to apply change to the part of a range that has not been changed by the other operation.
				let operations = a.range.getDifference( b.range ).map( ( range ) => {
					return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
				} );

				// Then we take care of the common part of ranges.
				const common = a.range.getIntersection( b.range );

				if ( common ) {
					// If this operation is more important, we also want to apply change to the part of the
					// original range that has already been changed by the other operation. Since that range
					// got changed we also have to update `oldValue`.
					if ( isStrong ) {
						operations.push( new AttributeOperation( common, b.key, b.newValue, a.newValue, a.baseVersion ) );
					} else if ( operations.length === 0 ) {
						operations.push( new NoOperation( 0 ) );
					}
				}

				return operations;
			} else {
				// If operations don't conflict, simply return an array containing just a clone of this operation.
				return [ a.clone() ];
			}
		},

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		// Transforms AttributeOperation `a` by MoveOperation `b`. Returns results as an array of operations.
		MoveOperation( a, b ) {
			// Convert MoveOperation properties into a range.
			const rangeB = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

			// This will aggregate transformed ranges.
			let ranges = [];

			// Special case when MoveOperation is in fact a RemoveOperation. RemoveOperation not only moves nodes but also
			// creates a "holder" element for them in graveyard. If there was a RemoveOperation pointing to an offset
			// before this AttributeOperation, we have to increment AttributeOperation's offset.
			if ( b instanceof RemoveOperation && b._needsHolderElement &&
				a.range.root == b.targetPosition.root && a.range.start.path[ 0 ] >= b._holderElementOffset
			) {
				// Do not change original operation!
				a = a.clone();
				a.range.start.path[ 0 ]++;
				a.range.end.path[ 0 ]++;
			}

			// Difference is a part of changed range that is modified by AttributeOperation but is not affected
			// by MoveOperation. This can be zero, one or two ranges (if moved range is inside changed range).
			// Right now we will make a simplification and join difference ranges and transform them as one. We will cover rangeB later.
			const difference = joinRanges( a.range.getDifference( rangeB ) );

			// Common is a range of nodes that is affected by MoveOperation. So it got moved to other place.
			const common = a.range.getIntersection( rangeB );

			if ( difference !== null ) {
				// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
				// Take the start and the end of the range and transform them by deletion of moved nodes.
				// Note that if rangeB was inside AttributeOperation range, only difference.end will be transformed.
				// This nicely covers the joining simplification we did in the previous step.
				difference.start = difference.start._getTransformedByDeletion( b.sourcePosition, b.howMany );
				difference.end = difference.end._getTransformedByDeletion( b.sourcePosition, b.howMany );

				// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
				// Note that since we operate on transformed difference range, we should transform by
				// previously transformed target position.
				// Note that we do not use Position._getTransformedByMove on range boundaries because we need to
				// transform by insertion a range as a whole, since newTargetPosition might be inside that range.
				ranges = difference._getTransformedByInsertion( b.getMovedRangeStart(), b.howMany, true, false ).reverse();
			}

			if ( common !== null ) {
				// Here we do not need to worry that newTargetPosition is inside moved range, because that
				// would mean that the MoveOperation targets into itself, and that is incorrect operation.
				// Instead, we calculate the new position of that part of original range.
				common.start = common.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
				common.end = common.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

				ranges.push( common );
			}

			// Map transformed range(s) to operations and return them.
			return ranges.map( ( range ) => {
				return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
			} );
		}
	},

	RootAttributeOperation: {
		InsertOperation: doNotUpdate,

		AttributeOperation: doNotUpdate,

		// Transforms RootAttributeOperation `a` by RootAttributeOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		RootAttributeOperation( a, b, isStrong ) {
			if ( a.root === b.root && a.key === b.key ) {
				if ( ( a.newValue !== b.newValue && !isStrong ) || a.newValue === b.newValue ) {
					return [ new NoOperation( a.baseVersion ) ];
				}
			}

			return [ a.clone() ];
		},

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		MoveOperation: doNotUpdate
	},

	RenameOperation: {
		// Transforms RenameOperation `a` by InsertOperation `b`. Returns results as an array of operations.
		InsertOperation( a, b ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			// Transform this operation's position.
			clone.position = clone.position._getTransformedByInsertion( b.position, b.nodes.maxOffset, true );

			return [ clone ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		// Transforms RenameOperation `a` by RenameOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		RenameOperation( a, b, isStrong ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( a.position.isEqual( b.position ) ) {
				if ( isStrong ) {
					clone.oldName = b.newName;
				} else {
					return [ new NoOperation( a.baseVersion ) ];
				}
			}

			return [ clone ];
		},

		MarkerOperation: doNotUpdate,

		// Transforms RenameOperation `a` by MoveOperation `b`. Returns results as an array of operations.
		MoveOperation( a, b ) {
			const clone = a.clone();
			const isSticky = clone.position.isEqual( b.sourcePosition );

			clone.position = clone.position._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, true, isSticky );

			return [ clone ];
		}
	},

	MarkerOperation: {
		// Transforms MarkerOperation `a` by InsertOperation `b`. Returns results as an array of operations.
		InsertOperation( a, b ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( clone.oldRange ) {
				clone.oldRange = clone.oldRange._getTransformedByInsertion( b.position, b.nodes.maxOffset, false, false )[ 0 ];
			}

			if ( clone.newRange ) {
				clone.newRange = clone.newRange._getTransformedByInsertion( b.position, b.nodes.maxOffset, false, false )[ 0 ];
			}

			return [ clone ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		// Transforms MarkerOperation `a` by MarkerOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		MarkerOperation( a, b, isStrong ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( a.name == b.name ) {
				if ( isStrong ) {
					clone.oldRange = b.newRange;
				} else {
					return [ new NoOperation( a.baseVersion ) ];
				}
			}

			return [ clone ];
		},

		// Transforms MarkerOperation `a` by MoveOperation `b`. Returns results as an array of operations.
		MoveOperation( a, b ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( clone.oldRange ) {
				const oldRanges = clone.oldRange._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );
				clone.oldRange = Range.createFromRanges( oldRanges );
			}

			if ( clone.newRange ) {
				const newRanges = clone.newRange._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany );
				clone.newRange = Range.createFromRanges( newRanges );
			}

			return [ clone ];
		}
	},

	MoveOperation: {
		// Transforms MoveOperation `a` by InsertOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		InsertOperation( a, b, isStrong ) {
			// Create range from MoveOperation properties and transform it by insertion.
			let range = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
			range = range._getTransformedByInsertion( b.position, b.nodes.maxOffset, false, a.isSticky )[ 0 ];

			let result = new a.constructor(
				range.start,
				range.end.offset - range.start.offset,
				a instanceof RemoveOperation ?
					a.baseVersion :
					a.targetPosition._getTransformedByInsertion( b.position, b.nodes.maxOffset, !isStrong ),
				a instanceof RemoveOperation ? undefined : a.baseVersion
			);

			result.isSticky = a.isSticky;

			if ( a instanceof RemoveOperation ) {
				result._needsHolderElement = a._needsHolderElement;
				result._holderElementOffset = a._holderElementOffset;
			}

			return [ result ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		// Transforms MoveOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		MoveOperation( a, b, isStrong ) {
			// Special case when both move operations' target positions are inside nodes that are
			// being moved by the other move operation. So in other words, we move ranges into inside of each other.
			// This case can't be solved reasonably (on the other hand, it should not happen often).
			if ( moveTargetIntoMovedRange( a, b ) && moveTargetIntoMovedRange( b, a ) ) {
				// Instead of transforming operation, we return a reverse of the operation that we transform by.
				// So when the results of this "transformation" will be applied, `b` MoveOperation will get reversed.
				return [ b.getReversed() ];
			}

			// Special case when both operations are RemoveOperations. RemoveOperation not only moves nodes but also
			// (usually) creates a "holder" element for them in graveyard. Each RemoveOperation should move nodes to different
			// "holder" element. If `a` operation points after `b` operation, we move `a` offset to acknowledge
			// "holder" element insertion.
			if ( a instanceof RemoveOperation && b instanceof RemoveOperation ) {
				const aTarget = a.targetPosition.path[ 0 ];
				const bTarget = b.targetPosition.path[ 0 ];

				if ( aTarget > bTarget || ( aTarget == bTarget && isStrong ) ) {
					// Do not change original operation!
					a = a.clone();
					a.targetPosition.path[ 0 ]++;
				}
			}

			// If only one of operations is a remove operation, we force remove operation to be the "stronger" one
			// to provide more expected results.
			if ( a instanceof RemoveOperation && !( b instanceof RemoveOperation ) ) {
				isStrong = true;
			} else if ( !( a instanceof RemoveOperation ) && b instanceof RemoveOperation ) {
				isStrong = false;
			}

			// Create ranges from MoveOperations properties.
			const rangeA = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
			const rangeB = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

			// This will aggregate transformed ranges.
			let ranges = [];

			// All the other non-special cases are treated by generic algorithm below.
			let difference = joinRanges( rangeA.getDifference( rangeB ) );

			if ( difference ) {
				difference.start = difference.start._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, !a.isSticky, false );
				difference.end = difference.end._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, a.isSticky, false );

				ranges.push( difference );
			}

			// Then, we have to manage the common part of both move ranges.
			const common = rangeA.getIntersection( rangeB );

			// If MoveOperations has common range it can be one of two:
			// * on the same tree level - it means that we move the same nodes into different places
			// * on deeper tree level - it means that we move nodes that are inside moved nodes
			// The operations are conflicting only if they try to move exactly same nodes, so only in the first case.
			// That means that we transform common part in two cases:
			// * `rangeA` is "deeper" than `rangeB` so it does not collide
			// * `rangeA` is at the same level but is stronger than `rangeB`.
			let aCompB = compareArrays( a.sourcePosition.getParentPath(), b.sourcePosition.getParentPath() );

			// If the `b` MoveOperation points inside the `a` MoveOperation range, the common part will be included in
			// range(s) that (is) are results of processing `difference`. If that's the case, we cannot include it again.
			let bTargetsToA = rangeA.containsPosition( b.targetPosition ) ||
				( rangeA.start.isEqual( b.targetPosition ) && a.isSticky ) ||
				( rangeA.end.isEqual( b.targetPosition ) && a.isSticky );

			// If the `b` MoveOperation range contains both whole `a` range and target position we do an exception and
			// transform `a` operation. Normally, when same nodes are moved, we stick with stronger operation's target.
			// Here it is a move inside larger range so there is no conflict because after all, all nodes from
			// smaller range will be moved to larger range target. The effect of this transformation feels natural.
			// Also if we wouldn't do that, we would get different results on both sides of transformation (i.e. in
			// collaborative editing).
			let aIsInside = rangeB.containsRange( rangeA ) &&
				( rangeB.containsPosition( a.targetPosition ) || rangeB.start.isEqual( a.targetPosition ) || rangeB.end.isEqual( a.targetPosition ) );

			if ( common !== null && ( aCompB === 'extension' || ( aCompB === 'same' && isStrong ) || aIsInside ) && !bTargetsToA ) {
				// Here we do not need to worry that newTargetPosition is inside moved range, because that
				// would mean that the MoveOperation targets into itself, and that is incorrect operation.
				// Instead, we calculate the new position of that part of original range.
				common.start = common.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
				common.end = common.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

				// We have to take care of proper range order.
				if ( difference && rangeA.start.isBefore( rangeB.start ) ) {
					ranges.push( common );
				} else {
					ranges.unshift( common );
				}
			}

			if ( ranges.length === 0 ) {
				// At this point we transformed this operation's source ranges it means that nothing should be changed.
				// But since we need to return an instance of Operation we return an array with NoOperation.

				if ( a instanceof RemoveOperation ) {
					// If `a` operation was RemoveOperation, we cannot convert it to NoOperation.
					// This is because RemoveOperation creates a holder in graveyard.
					// Even if we "remove nothing" we need a RemoveOperation to create holder element
					// so that the tree structure is synchronised between clients.
					// Note that this can happen only if both operations are remove operations, because in
					// other case RemoveOperation would be forced to be stronger and there would be a common range to move.
					a = a.clone();
					a.howMany = 0;
					a.sourcePosition = b.targetPosition;

					return [ a ];
				} else {
					return [ new NoOperation( a.baseVersion ) ];
				}
			}

			// Target position also could be affected by the other MoveOperation. We will transform it.
			let newTargetPosition = a.targetPosition._getTransformedByMove(
				b.sourcePosition,
				b.targetPosition,
				b.howMany,
				!isStrong,
				b.isSticky || aIsInside
			);

			// Map transformed range(s) to operations and return them.
			return ranges.reverse().map( ( range, i ) => {
				// We want to keep correct operation class.
				let result = new a.constructor(
					range.start,
					range.end.offset - range.start.offset,
					a instanceof RemoveOperation ? a.baseVersion : newTargetPosition,
					a instanceof RemoveOperation ? undefined : a.baseVersion
				);

				result.isSticky = a.isSticky;

				if ( a instanceof RemoveOperation ) {
					// Transformed `RemoveOperation` needs graveyard holder only when the original operation needed it.
					// If `RemoveOperation` got split into two or more operations, only first operation needs graveyard holder.
					result._needsHolderElement = a._needsHolderElement && i === 0;
					result._holderElementOffset = a._holderElementOffset;
				}

				return result;
			} );
		}
	}
};

function transform( a, b, isStrong ) {
	let group;
	let algorithm;

	if ( a instanceof InsertOperation ) {
		group = ot.InsertOperation;
	} else if ( a instanceof AttributeOperation ) {
		group = ot.AttributeOperation;
	} else if ( a instanceof RootAttributeOperation ) {
		group = ot.RootAttributeOperation;
	} else if ( a instanceof RenameOperation ) {
		group = ot.RenameOperation;
	} else if ( a instanceof MarkerOperation ) {
		group = ot.MarkerOperation;
	} else if ( a instanceof MoveOperation ) {
		group = ot.MoveOperation;
	} else {
		algorithm = doNotUpdate;
	}

	if ( group ) {
		if ( b instanceof InsertOperation ) {
			algorithm = group.InsertOperation;
		} else if ( b instanceof AttributeOperation ) {
			algorithm = group.AttributeOperation;
		} else if ( b instanceof RootAttributeOperation ) {
			algorithm = group.RootAttributeOperation;
		} else if ( b instanceof RenameOperation ) {
			algorithm = group.RenameOperation;
		} else if ( b instanceof MarkerOperation ) {
			algorithm = group.MarkerOperation;
		} else if ( b instanceof MoveOperation ) {
			algorithm = group.MoveOperation;
		} else {
			algorithm = doNotUpdate;
		}
	}

	let transformed = algorithm( a, b, isStrong );

	return updateBaseVersions( a.baseVersion, transformed );
}

// When we don't want to update an operation, we create and return a clone of it.
// Returns the operation in "unified format" - wrapped in an Array.
function doNotUpdate( operation ) {
	return [ operation.clone() ];
}

// Takes an Array of operations and sets consecutive base versions for them, starting from given base version.
// Returns the passed array.
function updateBaseVersions( baseVersion, operations ) {
	for ( let i = 0; i < operations.length; i++ ) {
		operations[ i ].baseVersion = baseVersion + i + 1;
	}

	return operations;
}

// Checks whether MoveOperation targetPosition is inside a node from the moved range of the other MoveOperation.
function moveTargetIntoMovedRange( a, b ) {
	return a.targetPosition._getTransformedByDeletion( b.sourcePosition, b.howMany ) === null;
}

// Gets an array of Ranges and produces one Range out of it. The root of a new range will be same as
// the root of the first range in the array. If any of given ranges has different root than the first range,
// it will be discarded.
function joinRanges( ranges ) {
	if ( ranges.length === 0 ) {
		return null;
	} else if ( ranges.length == 1 ) {
		return ranges[ 0 ];
	} else {
		ranges[ 0 ].end = ranges[ ranges.length - 1 ].end;

		return ranges[ 0 ];
	}
}
