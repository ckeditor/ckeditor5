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
 * @function transformOperation
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

	const ot = {
		InsertOperation: {
			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.InsertOperation} by {document.operation.InsertOperation}.
			 *
			 * @param {document.operation.InsertOperation} a Operation that will be transformed.
			 * @param {document.operation.InsertOperation} b Operation to transform by.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.InsertOperation>} Result of the transformation.
			 */
			InsertOperation( a, b, isStrong ) {
				// Transformed operations are always new instances, not references to the original operations.
				const transformed = a.clone();

				// Transform operation position by the other operation position.
				transformed.position = transformed.position.getTransformedByInsertion( b.position, b.nodeList.length, !isStrong );

				return [ transformed ];
			},

			ChangeOperation: doNotUpdate,

			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.InsertOperation} by {document.operation.MoveOperation}.
			 *
			 * @param {document.operation.InsertOperation} a Operation that will be transformed.
			 * @param {document.operation.MoveOperation} b Operation to transform by.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.InsertOperation>} Result of the transformation.
			 */
			MoveOperation( a, b, isStrong ) {
				const transformed = a.clone();

				// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
				const newPosition = a.position.getTransformedByDeletion( b.sourcePosition, b.howMany );

				if ( newPosition === null ) {
					// This operation's position was inside a node moved by MoveOperation. We substitute that position by
					// the combination of move target position and insert position. This reflects changes done by MoveOperation.

					transformed.position = transformed.position.getCombined( b.sourcePosition, b.targetPosition );
				} else {
					// Here we have the insert position after some nodes has been removed by MoveOperation.
					// Next step is to reflect pasting nodes by MoveOperation, which might further affect the position.

					transformed.position = newPosition.getTransformedByInsertion( b.targetPosition, b.howMany, !isStrong );
				}

				return [ transformed ];
			}
		},
		ChangeOperation: {
			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.ChangeOperation} by {document.operation.InsertOperation}.
			 *
			 * @param {document.operation.ChangeOperation} a Operation that will be transformed.
			 * @param {document.operation.InsertOperation} b Operation to transform by.
			 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
			 */
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

			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.ChangeOperation} by {document.operation.ChangeOperation}.
			 *
			 * @param {document.operation.ChangeOperation} a Operation that will be transformed.
			 * @param {document.operation.ChangeOperation} b Operation to transform by.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
			 */
			ChangeOperation( a, b, isStrong ) {
				if ( !isStrong && a.conflictsAttributesWith( b ) ) {
					// If operations' attributes are in conflict and this operation is less important
					// we have to check if operations' ranges intersect and manage them properly.

					// We get the range(s) which are only affected by this operation.
					const ranges = a.range.getDifference( b.range );

					if ( ranges.length === 0 ) {
						// If there are no such ranges, this operation should not do anything (as it is less important).
						return [ new NoOperation( a.baseVersion ) ];
					} else {
						// If there are such ranges, map them to operations and then return.
						return ranges.map( ( range ) => {
							return new ChangeOperation(
								range,
								a.oldAttr,
								a.newAttr,
								a.baseVersion
							);
						} );
					}
				} else {
					// If operations don't conflict or this operation is more important
					// simply, return an array containing just a clone of this operation.
					return [ a.clone() ];
				}
			},

			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.ChangeOperation} by {document.operation.MoveOperation}.
			 *
			 * @param {document.operation.ChangeOperation} a Operation that will be transformed.
			 * @param {document.operation.MoveOperation} b Operation to transform by.
			 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
			 */
			MoveOperation( a, b ) {
				// Convert MoveOperation properties into a range.
				const rangeB = Range.createFromPositionAndOffset( b.sourcePosition, b.howMany );

				// Get target position from the state "after" nodes specified by MoveOperation are "detached".
				const newTargetPosition = b.targetPosition.getTransformedByDeletion( b.sourcePosition, b.howMany );

				// This will aggregate transformed ranges.
				let ranges = [];

				const differenceSet = a.range.getDifference( rangeB );
				const common = a.range.getCommon( rangeB );

				// Difference is a part of changed range that is modified by ChangeOperation but are not affected
				// by MoveOperation. This can be zero, one or two ranges (if moved range is inside changed range).
				if ( differenceSet.length > 0 ) {
					const difference = differenceSet[ 0 ];

					// If two ranges were returned it means that rangeB was inside rangeA. We will cover rangeB later.
					// Right now we will make a simplification and join difference ranges and transform them as one.
					if ( differenceSet.length == 2 ) {
						difference.end = differenceSet[ 1 ].end.clone();
					}

					// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
					// Take the start and the end of the range and transform them by deletion of moved nodes.
					// Note that if rangeB was inside ChangeOperation range, only difference.end will be transformed.
					// This nicely covers the joining simplification we did in the previous step.
					difference.start = difference.start.getTransformedByDeletion( b.sourcePosition, b.howMany );
					difference.end = difference.end.getTransformedByDeletion( b.sourcePosition, b.howMany );

					// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
					// Note that since we operate on transformed difference range, we should transform by
					// previously transformed target position.
					ranges = difference.getTransformedByInsertion( newTargetPosition, b.howMany, false );
				}

				// Common is a range of nodes that is affected by MoveOperation. So it got moved to other place.
				if ( common !== null ) {
					// We substitute original position by the combination of target position and original position.
					// This reflects that those nodes were moved to another place by MoveOperation.
					common.start = common.start.getCombined( b.sourcePosition, newTargetPosition );
					common.end = common.end.getCombined( b.sourcePosition, newTargetPosition );

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
			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.MoveOperation} by {document.operation.InsertOperation}.
			 *
			 * @param {document.operation.MoveOperation} a Operation that will be transformed.
			 * @param {document.operation.InsertOperation} b Operation to transform by.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.MoveOperation>} Result of the transformation.
			 */
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

			/**
			 * Returns an array containing the result of transforming
			 * {document.operation.MoveOperation} by {document.operation.MoveOperation}.
			 *
			 * @param {document.operation.MoveOperation} a Operation that will be transformed.
			 * @param {document.operation.MoveOperation} b Operation to transform by.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.MoveOperation>} Result of the transformation.
			 */
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

				const differenceSet = rangeA.getDifference( rangeB );

				// MoveOperations ranges may intersect.
				// First, we take care of that part of the range that is only modified by transformed operation.
				if ( differenceSet.length > 0 ) {
					const difference = differenceSet[ 0 ];

					// If two ranges were returned it means that rangeB was inside rangeA. We will cover rangeB later.
					// Right now we will make a simplification and join difference ranges and transform them as one.
					if ( differenceSet.length == 2 ) {
						difference.end = differenceSet[ 1 ].end.clone();
					}

					// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
					// Take the start and the end of the range and transform them by deletion of moved nodes.
					// Note that if rangeB was inside rangeA, only difference.end will be transformed.
					// This nicely covers the joining simplification we did in the previous step.
					difference.start = difference.start.getTransformedByDeletion( b.sourcePosition, b.howMany );
					difference.end = difference.end.getTransformedByDeletion( b.sourcePosition, b.howMany );

					// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
					// Note that since we operate on transformed difference range, we should transform by
					// previously transformed target position.
					ranges = difference.getTransformedByInsertion( moveTargetPosition, b.howMany, true );
				}

				// Then, we have to manage the common part of both move ranges.
				// If MoveOperations has common range it can be one of two:
				// * on the same tree level - it means that we move the same nodes into different places
				// * on deeper tree level - it means that we move nodes that are inside moved nodes
				// The operations are conflicting only if they try to move exactly same nodes, so only in the first case.
				// So, we will handle common range if it is "deeper" or if transformed operation is more important.
				if ( utils.compareArrays( b.sourcePosition.parentPath, a.sourcePosition.parentPath ) == utils.compareArrays.PREFIX || isStrong ) {
					const common = rangeA.getCommon( rangeB );

					if ( common !== null ) {
						// We substitute original position by the combination of target position and original position.
						// This reflects that those nodes were moved to another place by MoveOperation.
						common.start = common.start.getCombined( b.sourcePosition, moveTargetPosition );
						common.end = common.end.getCombined( b.sourcePosition, moveTargetPosition );

						ranges.push( common );
					}
				}

				// At this point we transformed this operation's source range. Now, we need to transform target position.

				// First, transform target position by deletion of the other operation's range.
				let newTargetPosition = a.targetPosition.getTransformedByDeletion( b.sourcePosition, b.howMany );

				if ( newTargetPosition === null ) {
					// Transformed operation target position was inside a node moved by the other MoveOperation.
					// We substitute that position by the combination of the other move target position and
					// transformed operation target position. This reflects changes done by the other MoveOperation.

					newTargetPosition = a.targetPosition.getCombined( b.sourcePosition, moveTargetPosition );
				} else {
					// Here we have transformed operation target position after some nodes has been removed by MoveOperation.
					// Next step is to reflect pasting nodes by MoveOperation, which might further affect the position.

					newTargetPosition = newTargetPosition.getTransformedByInsertion( moveTargetPosition, b.howMany, true );
				}

				// If we haven't got any ranges this far it means that both operations tried to move the same nodes and
				// transformed operation is less important. We return NoOperation in this case.
				if ( ranges.length === 0 ) {
					return [ new NoOperation( a.baseVersion ) ];
				}

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
			group = ot.MoveOperation
		} else {
			algorithm = doNotUpdate;
		}

		if ( group ) {
			if ( b instanceof InsertOperation ) {
				algorithm = group.InsertOperation;
			} else if ( b instanceof ChangeOperation ) {
				algorithm = group.ChangeOperation;
			} else if ( b instanceof MoveOperation ) {
				algorithm = group.MoveOperation
			} else {
				algorithm = doNotUpdate;
			}
		}

		let transformed = algorithm( a, b, isStrong );

		return updateBaseVersions( a.baseVersion, transformed );
	};
} );
