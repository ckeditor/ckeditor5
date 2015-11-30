/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Transforms given {document.operation.Operation} by another {document.operation.Operation} and returns the result of
 * that transformation as an Array containing one or more {document.operation.Operation} elements.
 *
 * Operations operate on specified positions, passed to them when they are created. Whenever {@link document.Document document}
 * changes, we have to reflect those modifications by updating, or "transforming", operations (which are not yet applied).
 * When operation is transformed, its parameters may change basing on the operation by which it is transformed.
 * If the transform-by operation applied any modifications to the Tree Model that affects positions or nodes
 * connected with transformed operation, those changes will be reflected in the parameters of the returned operation(s).
 *
 * Whenever the {@link document.Document document} has different {@link document.Document#baseVersion}
 * than an operation you want to {@link document.Document#applyOperation apply}, you need to transform that
 * operation by all the operations that were applied to the {@link document.Document document} since it has
 * {@link document.Document#baseVersion} same as the operation. Transform them in the same order as those
 * operations were applied. This way all modifications done to the Tree Model will be reflected
 * in the operation parameters and the operation will "operate" on "up-to-date" version of the Tree Model.
 * This is mostly the case with Operational Transformation but it might be needed in particular features.
 *
 * In some cases, when given operation apply changes to the same nodes as this operation, there is a need
 * to create two operations as a result. It would be impossible to create just one operation that handles
 * modifications needed to be applied to the tree. This is why Array is returned instead of single object.
 * All returned operations has to be applied (or further transformed) to get an effect that was intended in
 * pre-transformed operation.
 *
 * Sometimes two operations are in conflict. This happens when they modify the same node in a different way, i.e.
 * set different value for the same attribute or move the node into different positions. When this happens,
 * we need to decide which operation is more important. We can't assume that operation `a` or operation `b` is always
 * important. In Operational Transformations algorithms we often need to get a result of transforming
 * `a` by `b` and also `b` by `a`. In both transformations the same operation has to be the important one. If we assume
 * that first or second passed operation is always more important we won't be able to solve this case.
 *
 * @function document.operation.transform
 * @param {document.operation.Operation} a Operation that will be transformed.
 * @param {document.operation.Operation} b Operation to transform by.
 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
 * when resolving conflicts.
 * @returns {Array.<document.operation.Operation>} Result of the transformation.
 */

CKEDITOR.define( [
	'document/operation/insertoperation',
	'document/operation/changeoperation',
	'document/operation/moveoperation',
	'document/operation/nooperation',
	'document/range',
	'utils'
], ( InsertOperation, ChangeOperation, MoveOperation, NoOperation, Range, utils ) => {
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
		return a.targetPosition.getTransformedByDeletion( b.sourcePosition, b.howMany ) === null;
	}

	// Takes two ChangeOperations and checks whether their attributes are in conflict.
	// This happens when both operations changes an attribute with the same key and they either set different
	// values for this attribute or one of them removes it while the other one sets it.
	// Returns true if attributes are in conflict.
	function haveConflictingAttributes( a, b ) {
		// Keeping in mind that newAttr or oldAttr might be null.
		// We will retrieve the key from whichever parameter is set.
		const keyA = ( a.newAttr || a.oldAttr ).key;
		const keyB = ( b.newAttr || b.oldAttr ).key;

		if ( keyA != keyB ) {
			// Different keys - not conflicting.
			return false;
		}

		if ( a.newAttr === null && b.newAttr === null ) {
			// Both remove the attribute - not conflicting.
			return false;
		}

		// Check if they set different value or one of them removes the attribute.
		return ( a.newAttr === null && b.newAttr !== null ) ||
			( a.newAttr !== null && b.newAttr === null ) ||
			( !a.newAttr.isEqual( b.newAttr ) );
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

	const ot = {
		InsertOperation: {
			// Transforms InsertOperation `a` by InsertOperation `b`. Accepts a flag stating whether `a` is more important
			// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
			InsertOperation( a, b, isStrong ) {
				// Transformed operations are always new instances, not references to the original operations.
				const transformed = a.clone();

				// Transform insert position by the other operation position.
				transformed.position = transformed.position.getTransformedByInsertion( b.position, b.nodeList.length, !isStrong );

				return [ transformed ];
			},

			ChangeOperation: doNotUpdate,

			// Transforms InsertOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
			// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
			MoveOperation( a, b, isStrong ) {
				const transformed = a.clone();

				// Transform insert position by the other operation parameters.
				transformed.position = a.position.getTransformedByMove( b.sourcePosition, b.targetPosition, b.howMany, !isStrong );

				return [ transformed ];
			}
		},
		ChangeOperation: {
			// Transforms ChangeOperation `a` by InsertOperation `b`. Returns results as an array of operations.
			InsertOperation( a, b ) {
				// Transform this operation's range.
				const ranges = a.range.getTransformedByInsertion( b.position, b.nodeList.length );

				// Map transformed range(s) to operations and return them.
				return ranges.map( ( range ) => {
					return new ChangeOperation(
						range,
						a.oldAttr,
						a.newAttr,
						a.baseVersion
					);
				} );
			},

			// Transforms ChangeOperation `a` by ChangeOperation `b`. Accepts a flag stating whether `a` is more important
			// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
			ChangeOperation( a, b, isStrong ) {
				if ( haveConflictingAttributes( a, b ) ) {
					// If operations attributes are in conflict, check if their ranges intersect and manage them properly.
					let operations = [];

					// First, we want to apply change to the part of a range that has not been changed by the other operation.
					operations = operations.concat(
						a.range.getDifference( b.range ).map( ( range ) => {
							return new ChangeOperation( range, a.oldAttr, a.newAttr, a.baseVersion );
						} )
					);

					if ( isStrong ) {
						// If this operation is more important, we want also want to apply change to the part of the
						// original range that has already been changed by the other operation. Since that range
						// got changed we have to update oldAttr.
						const common = a.range.getIntersection( b.range );

						if ( common !== null ) {
							operations.push( new ChangeOperation( common, b.oldAttr, a.newAttr, a.baseVersion ) );
						}
					}

					// If no operations has been added nothing should get updated, but since we need to return
					// an instance of Operation we add NoOperation to the array.
					if ( operations.length === 0 ) {
						operations.push( new NoOperation( a.baseVersion ) );
					}

					return operations;
				} else {
					// If operations don't conflict simply, return an array containing just a clone of this operation.
					return [ a.clone() ];
				}
			},

			// Transforms ChangeOperation `a` by MoveOperation `b`. Returns results as an array of operations.
			MoveOperation( a, b ) {
				// Convert MoveOperation properties into a range.
				const rangeB = Range.createFromPositionAndOffset( b.sourcePosition, b.howMany );

				// Get target position from the state "after" nodes specified by MoveOperation are "detached".
				const newTargetPosition = b.targetPosition.getTransformedByDeletion( b.sourcePosition, b.howMany );

				// This will aggregate transformed ranges.
				let ranges = [];

				// Difference is a part of changed range that is modified by ChangeOperation but are not affected
				// by MoveOperation. This can be zero, one or two ranges (if moved range is inside changed range).
				// If two ranges were returned it means that rangeB was inside rangeA. We will cover rangeB later.
				// Right now we will make a simplification and join difference ranges and transform them as one.
				const difference = joinRanges( a.range.getDifference( rangeB ) );

				// Common is a range of nodes that is affected by MoveOperation. So it got moved to other place.
				const common = a.range.getIntersection( rangeB );

				if ( difference !== null ) {
					// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
					// Take the start and the end of the range and transform them by deletion of moved nodes.
					// Note that if rangeB was inside ChangeOperation range, only difference.end will be transformed.
					// This nicely covers the joining simplification we did in the previous step.
					difference.start = difference.start.getTransformedByDeletion( b.sourcePosition, b.howMany );
					difference.end = difference.end.getTransformedByDeletion( b.sourcePosition, b.howMany );

					// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
					// Note that since we operate on transformed difference range, we should transform by
					// previously transformed target position.
					// Note that we do not use Position.getTransformedByMove on range boundaries because we need to
					// transform by insertion a range as a whole, since newTargetPosition might be inside that range.
					ranges = difference.getTransformedByInsertion( newTargetPosition, b.howMany, false );
				}

				if ( common !== null ) {
					// Here we do not need to worry that newTargetPosition is inside moved range, because that
					// would mean that the MoveOperation targets into itself, and that is incorrect operation.
					// Instead, we calculate the new position of that part of original range.
					common.start = common.start._getCombined( b.sourcePosition, newTargetPosition );
					common.end = common.end._getCombined( b.sourcePosition, newTargetPosition );

					ranges.push( common );
				}

				// Map transformed range(s) to operations and return them.
				return ranges.map( ( range ) => {
					return new ChangeOperation(
						range,
						a.oldAttr,
						a.newAttr,
						a.baseVersion
					);
				} );
			}
		},
		MoveOperation: {
			// Transforms MoveOperation `a` by InsertOperation `b`. Accepts a flag stating whether `a` is more important
			// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
			InsertOperation( a, b, isStrong ) {
				// Get target position from the state "after" nodes are inserted by InsertOperation.
				const newTargetPosition = a.targetPosition.getTransformedByInsertion( b.position, b.nodeList.length, !isStrong );

				// Create range from MoveOperation properties and transform it by insertion as well.
				const rangeB = Range.createFromPositionAndOffset( a.sourcePosition, a.howMany );
				const ranges = rangeB.getTransformedByInsertion( b.position, b.nodeList.length, true );

				// Map transformed range(s) to operations and return them.
				return ranges.map( ( range ) => {
					return new MoveOperation(
						range.start,
						newTargetPosition.clone(),
						range.end.offset - range.start.offset,
						a.baseVersion
					);
				} );
			},

			ChangeOperation: doNotUpdate,

			// Transforms MoveOperation `a` by MoveOperation `b`. Accepts a flag stating whether `a` is more important
			// than `b` when it comes to resolving conflicts. Returns results as an array of operations.
			MoveOperation( a, b, isStrong ) {
				// There is a special case when both move operations' target positions are inside nodes that are
				// being moved by the other move operation. So in other words, we move ranges into inside of each other.
				// This case can't be solved reasonably (on the other hand, it should not happen often).
				if ( moveTargetIntoMovedRange( a, b ) && moveTargetIntoMovedRange( b, a ) ) {
					// Instead of transforming operation, we return a reverse of the operation that we transform by.
					// So when the results of this "transformation" will be applied, `b` MoveOperation will get reversed.
					return [ b.getReversed() ];
				}

				// Get target position from the state "after" nodes specified by other MoveOperation are "detached".
				const moveTargetPosition = b.targetPosition.getTransformedByDeletion( b.sourcePosition, b.howMany );

				// This will aggregate transformed ranges.
				let ranges = [];

				// Create ranges from MoveOperations properties.
				const rangeA = Range.createFromPositionAndOffset( a.sourcePosition, a.howMany );
				const rangeB = Range.createFromPositionAndOffset( b.sourcePosition, b.howMany );

				// MoveOperations ranges may intersect.

				// First, we take care of that part of the range that is only modified by transformed operation.
				// If two ranges were returned it means that rangeB was inside rangeA. We will cover rangeB later.
				// Right now we will make a simplification and join difference ranges and transform them as one.
				const difference = joinRanges( rangeA.getDifference( rangeB ) );

				if ( difference !== null ) {
					// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
					// Take the start and the end of the range and transform them by deletion of moved nodes.
					// Note that if rangeB was inside rangeA, only difference.end will be transformed.
					// This nicely covers the joining simplification we did in the previous step.
					difference.start = difference.start.getTransformedByDeletion( b.sourcePosition, b.howMany );
					difference.end = difference.end.getTransformedByDeletion( b.sourcePosition, b.howMany );

					// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
					// Note that since we operate on transformed difference range, we should transform by
					// previously transformed target position.
					// Note that we do not use Position.getTransformedByMove on range boundaries because we need to
					// transform by insertion a range as a whole, since newTargetPosition might be inside that range.
					ranges = difference.getTransformedByInsertion( moveTargetPosition, b.howMany, true );
				}

				// Then, we have to manage the common part of both move ranges.
				// If MoveOperations has common range it can be one of two:
				// * on the same tree level - it means that we move the same nodes into different places
				// * on deeper tree level - it means that we move nodes that are inside moved nodes
				// The operations are conflicting only if they try to move exactly same nodes, so only in the first case.
				// So, we will handle common range if it is "deeper" or if transformed operation is more important.
				let isDeeper = utils.compareArrays( b.sourcePosition.getParentPath(), a.sourcePosition.getParentPath() ) == utils.compareArrays.PREFIX;

				if ( isDeeper || isStrong ) {
					const common = rangeA.getIntersection( rangeB );

					if ( common !== null ) {
						// Here we do not need to worry that newTargetPosition is inside moved range, because that
						// would mean that the MoveOperation targets into itself, and that is incorrect operation.
						// Instead, we calculate the new position of that part of original range.
						common.start = common.start._getCombined( b.sourcePosition, moveTargetPosition );
						common.end = common.end._getCombined( b.sourcePosition, moveTargetPosition );

						ranges.push( common );
					}
				}

				// At this point we transformed this operation's source ranges it means that nothing should be changed.
				// But since we need to return an instance of Operation we return an array with NoOperation.
				if ( ranges.length === 0 ) {
					return [ new NoOperation( a.baseVersion ) ];
				}

				// Target position also could be affected by the other MoveOperation. We will transform it.
				let newTargetPosition = a.targetPosition.getTransformedByMove( b.sourcePosition, moveTargetPosition, b.howMany, !isStrong );

				// At this point we might have multiple ranges. All ranges will be moved to the same, newTargetPosition.
				// To keep them in the right order, we need to move them starting from the last one.
				// [|ABC||DEF||GHI|] ==> [^], [|ABC||DEF|] ==> [^GHI], [|ABC|] ==> [^DEFGHI], [] ==> [ABCDEFGHI]
				// To achieve this, we sort ranges by their starting position in descending order.
				ranges.sort( ( a, b ) => a.start.isBefore( b.start ) ? 1 : -1 );

				// Map transformed range(s) to operations and return them.
				return ranges.map( ( range ) => {
					return new MoveOperation(
						range.start,
						newTargetPosition,
						range.end.offset - range.start.offset,
						a.baseVersion
					);
				} );
			}
		}
	};

	return ( a, b, isStrong ) => {
		let group;
		let algorithm;

		if ( a instanceof InsertOperation ) {
			group = ot.InsertOperation;
		} else if ( a instanceof ChangeOperation ) {
			group = ot.ChangeOperation;
		} else if ( a instanceof MoveOperation ) {
			group = ot.MoveOperation;
		} else {
			algorithm = doNotUpdate;
		}

		if ( group ) {
			if ( b instanceof InsertOperation ) {
				algorithm = group.InsertOperation;
			} else if ( b instanceof ChangeOperation ) {
				algorithm = group.ChangeOperation;
			} else if ( b instanceof MoveOperation ) {
				algorithm = group.MoveOperation;
			} else {
				algorithm = doNotUpdate;
			}
		}

		let transformed = algorithm( a, b, isStrong );

		return updateBaseVersions( a.baseVersion, transformed );
	};
} );
