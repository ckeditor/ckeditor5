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
import ReinsertOperation from './reinsertoperation';
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
 * @function module:engine/model/operation/transform~transform
 * @param {module:engine/model/operation/operation~Operation} a Operation that will be transformed.
 * @param {module:engine/model/operation/operation~Operation} b Operation to transform by.
 * @param {module:engine/model/delta/transform~transformationContext} [context] Transformation context.
 * @returns {Array.<module:engine/model/operation/operation~Operation>} Result of the transformation.
 */

export default transform;

const ot = {
	InsertOperation: {
		// Transforms InsertOperation `a` by InsertOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		InsertOperation( a, b, context ) {
			// Transformed operations are always new instances, not references to the original operations.
			const transformed = a.clone();

			// Check whether there is a forced order of nodes or use `context.isStrong` flag for conflict resolving.
			const insertBefore = context.insertBefore === undefined ? !context.isStrong : context.insertBefore;

			// Transform insert position by the other operation position.
			transformed.position = transformed.position._getTransformedByInsertion( b.position, b.nodes.maxOffset, insertBefore );

			return [ transformed ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		// Transforms InsertOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		MoveOperation( a, b, context ) {
			const transformed = a.clone();

			// Check whether there is a forced order of nodes or use `context.isStrong` flag for conflict resolving.
			const insertBefore = context.insertBefore === undefined ? !context.isStrong : context.insertBefore;

			// Transform insert position by the other operation parameters.
			transformed.position = a.position._getTransformedByMove(
				b.sourcePosition,
				b.targetPosition,
				b.howMany,
				insertBefore,
				b.isSticky && !context.forceNotSticky
			);

			return [ transformed ];
		}
	},

	AttributeOperation: {
		// Transforms AttributeOperation `a` by InsertOperation `b`. Returns results as an array of operations.
		InsertOperation( a, b ) {
			// Transform this operation's range.
			const ranges = a.range._getTransformedByInsertion( b.position, b.nodes.maxOffset, true, false );

			// Map transformed range(s) to operations and return them.
			return ranges.reverse().map( range => {
				return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
			} );
		},

		// Transforms AttributeOperation `a` by AttributeOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		AttributeOperation( a, b, context ) {
			if ( a.key === b.key ) {
				// If operations attributes are in conflict, check if their ranges intersect and manage them properly.

				// First, we want to apply change to the part of a range that has not been changed by the other operation.
				const operations = a.range.getDifference( b.range ).map( range => {
					return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
				} );

				// Then we take care of the common part of ranges.
				const common = a.range.getIntersection( b.range );

				if ( common ) {
					// If this operation is more important, we also want to apply change to the part of the
					// original range that has already been changed by the other operation. Since that range
					// got changed we also have to update `oldValue`.
					if ( context.isStrong ) {
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
			return ranges.map( range => {
				return new AttributeOperation( range, a.key, a.oldValue, a.newValue, a.baseVersion );
			} );
		}
	},

	RootAttributeOperation: {
		InsertOperation: doNotUpdate,

		AttributeOperation: doNotUpdate,

		// Transforms RootAttributeOperation `a` by RootAttributeOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		RootAttributeOperation( a, b, context ) {
			if ( a.root === b.root && a.key === b.key ) {
				if ( ( a.newValue !== b.newValue && !context.isStrong ) || a.newValue === b.newValue ) {
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
		RenameOperation( a, b, context ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( a.position.isEqual( b.position ) ) {
				if ( context.isStrong ) {
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
		MarkerOperation( a, b, context ) {
			// Clone the operation, we don't want to alter the original operation.
			const clone = a.clone();

			if ( a.name == b.name ) {
				if ( context.isStrong ) {
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
		InsertOperation( a, b, context ) {
			// Create range from MoveOperation properties and transform it by insertion.
			let range = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
			range = range._getTransformedByInsertion( b.position, b.nodes.maxOffset, false, a.isSticky && !context.forceNotSticky )[ 0 ];

			// Check whether there is a forced order of nodes or use `context.isStrong` flag for conflict resolving.
			const insertBefore = context.insertBefore === undefined ? !context.isStrong : context.insertBefore;

			const result = new a.constructor(
				range.start,
				range.end.offset - range.start.offset,
				a.targetPosition._getTransformedByInsertion( b.position, b.nodes.maxOffset, insertBefore ),
				a.baseVersion
			);

			result.isSticky = a.isSticky;

			return [ result ];
		},

		AttributeOperation: doNotUpdate,

		RootAttributeOperation: doNotUpdate,

		RenameOperation: doNotUpdate,

		MarkerOperation: doNotUpdate,

		// Transforms MoveOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
		// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
		MoveOperation( a, b, context ) {
			//
			// Setting and evaluating some variables that will be used in special cases and default algorithm.
			//
			// Create ranges from `MoveOperations` properties.
			const rangeA = Range.createFromPositionAndShift( a.sourcePosition, a.howMany );
			const rangeB = Range.createFromPositionAndShift( b.sourcePosition, b.howMany );

			// Assign `context.isStrong` to a different variable, because the value may change during execution of
			// this algorithm and we do not want to override original `context.isStrong` that will be used in later transformations.
			let isStrong = context.isStrong;

			// Whether range moved by operation `b` is includable in operation `a` move range.
			// For this, `a` operation has to be sticky (so `b` sticks to the range) and context has to allow stickiness.
			const includeB = a.isSticky && !context.forceNotSticky;

			// Evaluate new target position for transformed operation.
			// Check whether there is a forced order of nodes or use `isStrong` flag for conflict resolving.
			const insertBefore = context.insertBefore === undefined ? !isStrong : context.insertBefore;

			// `a.targetPosition` could be affected by the `b` operation. We will transform it.
			const newTargetPosition = a.targetPosition._getTransformedByMove(
				b.sourcePosition,
				b.targetPosition,
				b.howMany,
				insertBefore,
				b.isSticky && !context.forceNotSticky
			);

			//
			// Special case #1 + mirror.
			//
			// Special case when both move operations' target positions are inside nodes that are
			// being moved by the other move operation. So in other words, we move ranges into inside of each other.
			// This case can't be solved reasonably (on the other hand, it should not happen often).
			if ( moveTargetIntoMovedRange( a, b ) && moveTargetIntoMovedRange( b, a ) ) {
				// Instead of transforming operation, we return a reverse of the operation that we transform by.
				// So when the results of this "transformation" will be applied, `b` MoveOperation will get reversed.
				return [ b.getReversed() ];
			}
			//
			// End of special case #1.
			//

			//
			// Special case #2.
			//
			// Check if `b` operation targets inside `rangeA`. Use stickiness if possible.
			const bTargetsToA = rangeA.containsPosition( b.targetPosition ) ||
				( rangeA.start.isEqual( b.targetPosition ) && includeB ) ||
				( rangeA.end.isEqual( b.targetPosition ) && includeB );

			// If `b` targets to `rangeA` and `rangeA` contains `rangeB`, `b` operation has no influence on `a` operation.
			// You might say that operation `b` is captured inside operation `a`.
			if ( bTargetsToA && rangeA.containsRange( rangeB, true ) ) {
				// There is a mini-special case here, where `rangeB` is on other level than `rangeA`. That's why
				// we need to transform `a` operation anyway.
				rangeA.start = rangeA.start._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, !includeB );
				rangeA.end = rangeA.end._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, includeB );

				return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition, a );
			}

			//
			// Special case #2 mirror.
			//
			const aTargetsToB = rangeB.containsPosition( a.targetPosition ) ||
				( rangeB.start.isEqual( a.targetPosition ) && b.isSticky && !context.forceNotSticky ) ||
				( rangeB.end.isEqual( a.targetPosition ) && b.isSticky && !context.forceNotSticky );

			if ( aTargetsToB && rangeB.containsRange( rangeA, true ) ) {
				// `a` operation is "moved together" with `b` operation.
				// Here, just move `rangeA` "inside" `rangeB`.
				rangeA.start = rangeA.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
				rangeA.end = rangeA.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

				return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition, a );
			}
			//
			// End of special case #2.
			//

			//
			// Special case #3 + mirror.
			//
			// `rangeA` has a node which is an ancestor of `rangeB`. In other words, `rangeB` is inside `rangeA`
			// but not on the same tree level. In such case ranges have common part but we have to treat it
			// differently, because in such case those ranges are not really conflicting and should be treated like
			// two separate ranges. Also we have to discard two difference parts.
			const aCompB = compareArrays( a.sourcePosition.getParentPath(), b.sourcePosition.getParentPath() );

			if ( aCompB == 'prefix' || aCompB == 'extension' ) {
				// Transform `rangeA` by `b` operation and make operation out of it, and that's all.
				// Note that this is a simplified version of default case, but here we treat the common part (whole `rangeA`)
				// like a one difference part.
				rangeA.start = rangeA.start._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, !includeB );
				rangeA.end = rangeA.end._getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, includeB );

				return makeMoveOperationsFromRanges( [ rangeA ], newTargetPosition, a );
			}
			//
			// End of special case #3.
			//

			//
			// Default case - ranges are on the same level or are not connected with each other.
			//
			// Modifier for default case.
			// Modifies `isStrong` flag in certain conditions.
			//
			// If only one of operations is a remove operation, we force remove operation to be the "stronger" one
			// to provide more expected results. This is done only if `context.forceWeakRemove` is set to `false`.
			// `context.forceWeakRemove` is set to `true` in certain conditions when transformation takes place during undo.
			if ( !context.forceWeakRemove ) {
				if ( a instanceof RemoveOperation && !( b instanceof RemoveOperation ) ) {
					isStrong = true;
				} else if ( !( a instanceof RemoveOperation ) && b instanceof RemoveOperation ) {
					isStrong = false;
				}
			}

			// Handle operation's source ranges - check how `rangeA` is affected by `b` operation.
			// This will aggregate transformed ranges.
			const ranges = [];

			// Get the "difference part" of `a` operation source range.
			// This is an array with one or two ranges. Two ranges if `rangeB` is inside `rangeA`.
			const difference = rangeA.getDifference( rangeB );

			for ( const range of difference ) {
				// Transform those ranges by `b` operation. For example if `b` moved range from before those ranges, fix those ranges.
				range.start = range.start._getTransformedByDeletion( b.sourcePosition, b.howMany );
				range.end = range.end._getTransformedByDeletion( b.sourcePosition, b.howMany );

				// If `b` operation targets into `rangeA` on the same level, spread `rangeA` into two ranges.
				const shouldSpread = compareArrays( range.start.getParentPath(), b.getMovedRangeStart().getParentPath() ) == 'same';
				const newRanges = range._getTransformedByInsertion( b.getMovedRangeStart(), b.howMany, shouldSpread, includeB );

				ranges.push( ...newRanges );
			}

			// Then, we have to manage the "common part" of both move ranges.
			const common = rangeA.getIntersection( rangeB );

			if ( common !== null && isStrong && !bTargetsToA ) {
				// Calculate the new position of that part of original range.
				common.start = common.start._getCombined( b.sourcePosition, b.getMovedRangeStart() );
				common.end = common.end._getCombined( b.sourcePosition, b.getMovedRangeStart() );

				// Take care of proper range order.
				//
				// Put `common` at appropriate place. Keep in mind that we are interested in original order.
				// Basically there are only three cases: there is zero, one or two difference ranges.
				//
				// If there is zero difference ranges, just push `common` in the array.
				if ( ranges.length === 0 ) {
					ranges.push( common );
				}
				// If there is one difference range, we need to check whether common part was before it or after it.
				else if ( ranges.length == 1 ) {
					if ( rangeB.start.isBefore( rangeA.start ) || rangeB.start.isEqual( rangeA.start ) ) {
						ranges.unshift( common );
					} else {
						ranges.push( common );
					}
				}
				// If there are more ranges (which means two), put common part between them. This is the only scenario
				// where there could be two difference ranges so we don't have to make any comparisons.
				else {
					ranges.splice( 1, 0, common );
				}
			}

			if ( ranges.length === 0 ) {
				// If there are no "source ranges", nothing should be changed.
				// Note that this can happen only if `isStrong == false` and `rangeA.isEqual( rangeB )`.
				return [ new NoOperation( a.baseVersion ) ];
			}

			return makeMoveOperationsFromRanges( ranges, newTargetPosition, a );
		}
	}
};

function transform( a, b, context = { isStrong: false } ) {
	let group, algorithm;

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

	const transformed = algorithm( a, b, context );

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

// Helper function for `MoveOperation` x `MoveOperation` transformation.
// Convert given ranges and target position to move operations and return them.
// Ranges and target position will be transformed on-the-fly when generating operations.
// Given `ranges` should be in the order of how they were in the original transformed operation.
// Given `targetPosition` is the target position of the first range from `ranges`.
function makeMoveOperationsFromRanges( ranges, targetPosition, a ) {
	// At this moment we have some ranges and a target position, to which those ranges should be moved.
	// Order in `ranges` array is the go-to order of after transformation.
	//
	// We are almost done. We have `ranges` and `targetPosition` to make operations from.
	// Unfortunately, those operations may affect each other. Precisely, first operation after move
	// may affect source range and target position of second and third operation. Same with second
	// operation affecting third.
	//
	// We need to fix those source ranges and target positions once again, before converting `ranges` to operations.
	const operations = [];

	// Keep in mind that nothing will be transformed if there is just one range in `ranges`.
	for ( let i = 0; i < ranges.length; i++ ) {
		// Create new operation out of a range and target position.
		const op = makeMoveOperation( ranges[ i ], targetPosition, a.isSticky );

		operations.push( op );

		// Transform other ranges by the generated operation.
		for ( let j = i + 1; j < ranges.length; j++ ) {
			// All ranges in `ranges` array should be:
			// * non-intersecting (these are part of original operation source range), and
			// * `targetPosition` does not target into them (opposite would mean that transformed operation targets "inside itself").
			//
			// This means that the transformation will be "clean" and always return one result.
			ranges[ j ] = ranges[ j ]._getTransformedByMove( op.sourcePosition, op.targetPosition, op.howMany )[ 0 ];
		}

		targetPosition = targetPosition._getTransformedByMove( op.sourcePosition, op.targetPosition, op.howMany, true, false );
	}

	return operations;
}

function makeMoveOperation( range, targetPosition, isSticky ) {
	// We want to keep correct operation class.
	let OperationClass;

	if ( targetPosition.root.rootName == '$graveyard' ) {
		OperationClass = RemoveOperation;
	} else if ( range.start.root.rootName == '$graveyard' ) {
		OperationClass = ReinsertOperation;
	} else {
		OperationClass = MoveOperation;
	}

	const result = new OperationClass(
		range.start,
		range.end.offset - range.start.offset,
		targetPosition,
		0 // Is corrected anyway later.
	);

	result.isSticky = isSticky;

	return result;
}
