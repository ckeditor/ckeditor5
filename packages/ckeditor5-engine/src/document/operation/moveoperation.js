/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'ckeditorerror',
	'utils',
	'document/operation/nooperation',
	'document/range',
	//'document/operation/insertoperation'
], ( Operation, CKEditorError, utils, NoOperation, Range ) => {
	/**
	 * Operation to move list of subsequent nodes from one position in the document to another.
	 *
	 * @class document.operation.MoveOperation
	 */
	class MoveOperation extends Operation {
		/**
		 * Creates a move operation.
		 *
		 * @param {document.Position} sourcePosition Position before the first element to move.
		 * @param {document.Position} targetPosition Position where moved elements will be inserted.
		 * @param {Number} howMany How many consecutive nodes to move, starting from `sourcePosition`.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( sourcePosition, targetPosition, howMany, baseVersion ) {
			super( baseVersion );

			/**
			 * Source move position.
			 *
			 * @type {document.Position}
			 */
			this.sourcePosition = sourcePosition;

			/**
			 * Target move position.
			 *
			 * @type {document.Position}
			 */
			this.targetPosition = targetPosition;

			/**
			 * How many nodes to move.
			 *
			 * @type {Number}
			 */
			this.howMany = howMany;
		}

		_execute() {
			let sourceElement = this.sourcePosition.parent;
			let targetElement = this.targetPosition.parent;
			let sourceOffset = this.sourcePosition.offset;
			let targetOffset = this.targetPosition.offset;

			// Validate whether move operation has correct parameters.
			// Validation is pretty complex but move operation is one of the core ways to manipulate the document state.
			// We expect that many errors might be connected with one of scenarios described below.
			if ( !sourceElement || !targetElement ) {
				/**
				 * Source position or target position is invalid.
				 *
				 * @error operation-move-position-invalid
				 */
				throw new CKEditorError(
					'operation-move-position-invalid: Source position or target position is invalid.'
				);
			} else if ( sourceOffset + this.howMany > sourceElement.getChildCount() ) {
				/**
				 * The nodes which should be moved do not exist.
				 *
				 * @error operation-move-nodes-do-not-exist
				 */
				throw new CKEditorError(
					'operation-move-nodes-do-not-exist: The nodes which should be moved do not exist.'
				);
			} else if ( sourceElement === targetElement && sourceOffset <= targetOffset && targetOffset < sourceOffset + this.howMany ) {
				/**
				 * Trying to move a range of nodes into the middle of that range.
				 *
				 * @error operation-move-range-into-itself
				 */
				throw new CKEditorError(
					'operation-move-range-into-itself: Trying to move a range of nodes to the inside of that range.'
				);
			} else {
				const sourcePath = this.sourcePosition.parentPath;
				const targetPath = this.targetPosition.parentPath;

				if ( utils.compareArrays( sourcePath, targetPath ) == utils.compareArrays.PREFIX ) {
					let i = sourcePath.length;

					if ( this.targetPosition.path[ i ] >= sourceOffset && this.targetPosition.path[ i ] < sourceOffset + this.howMany ) {
						/**
						 * Trying to move a range of nodes into one of nodes from that range.
						 *
						 * @error operation-move-node-into-itself
						 */
						throw new CKEditorError(
							'operation-move-node-into-itself: Trying to move a range of nodes into one of nodes from that range.'
						);
					}
				}
			}
			// End of validation.

			// If we move children in the same element and we remove elements on the position before the target we
			// need to update a target offset.
			if ( sourceElement === targetElement && sourceOffset < targetOffset ) {
				targetOffset -= this.howMany;
			}

			const removedNodes = sourceElement.removeChildren( sourceOffset, this.howMany );

			targetElement.insertChildren( targetOffset, removedNodes );
		}

		getReversed() {
			return new MoveOperation( this.targetPosition.clone(), this.sourcePosition.clone(), this.howMany, this.baseVersion + 1 );
		}

		getTransformedBy( operation, isStrong ) {
			// Circular dependency re-require.
			const InsertOperation = CKEDITOR.require( 'document/operation/insertoperation' );

			if ( operation instanceof InsertOperation ) {
				return getTransformedByInsertOperation.call( this, operation, !!isStrong );
			} else if ( operation instanceof MoveOperation ) {
				return getTransformedByMoveOperation.call( this, operation, !!isStrong );
			}

			return [ this.clone( this.baseVersion + 1 ) ];
		}

		clone( baseVersion ) {
			if ( !baseVersion ) {
				baseVersion = this.baseVersion;
			}

			return new MoveOperation( this.sourcePosition.clone(), this.targetPosition.clone(), this.howMany, baseVersion );
		}
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.InsertOperation}.
	 *
	 * @method getTransformedByInsertOperation
	 * @param {document.operation.InsertOperation} insert Operation to transform by.
	 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
	 * when resolving conflicts.
	 * @returns {Array.<document.operation.MoveOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByInsertOperation( insert, isStrong ) {
		/*jshint validthis:true */

		// Get a target position from a state "after" nodes are inserted by InsertOperation.
		const newTargetPosition = this.targetPosition.getTransformedByInsertion( insert.position, insert.nodeList.length, !isStrong );

		// Create a range from MoveOperation properties and transform it by insertion as well.
		const moveRange = Range.createFromPositionAndOffset( this.sourcePosition, this.howMany );
		const ranges = moveRange.getTransformedByInsertion( insert.position, insert.nodeList.length, true );

		// Map transformed range(s) to operations and return them.
		return ranges.map( ( range, i ) => {
			return new MoveOperation(
				range.start,
				newTargetPosition.clone(),
				range.end.offset - range.start.offset,
				this.baseVersion + i + 1
			);
		} );
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.MoveOperation}.
	 *
	 * @method getTransformedByMoveOperation
	 * @param {document.operation.MoveOperation} move Operation to transform by.
	 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
	 * when resolving conflicts.
	 * @returns {Array.<document.operation.MoveOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByMoveOperation( move, isStrong ) {
		/*jshint validthis:true */

		// There is a special case when both move operations' target positions are inside nodes that are
		// being moved by the other move operation. So in other words, we move ranges into inside of each other.
		// This case can't be solved reasonably (on the other hand, it should not happen often).
		if ( _targetsIntoMoveOperation.call( this, move ) && _targetsIntoMoveOperation.call( move, this ) ) {
			// Instead of transforming this operation, we return a reverse of the operation that we transform by.
			// So when the results of this "transformation" will be applied, given MoveOperation will get reversed.
			return [ move.getReversed() ];
		}

		// Get a target position from a state "after" nodes from moveRange are "detached".
		const moveTargetPosition = move.targetPosition.getTransformedByDeletion( move.sourcePosition, move.howMany );

		// This will aggregate transformed ranges.
		let ranges = [];

		// Create ranges from MoveOperations properties.
		const thisRange = Range.createFromPositionAndOffset( this.sourcePosition, this.howMany );
		const moveRange = Range.createFromPositionAndOffset( move.sourcePosition, move.howMany );

		const differenceSet = thisRange.getDifference( moveRange );

		// MoveOperations ranges may intersect.
		// First, we take care of that part of the range that is only modified by this operation.
		if ( differenceSet.length > 0 ) {
			const difference = differenceSet[ 0 ];

			// If two ranges were returned it means that moveRange was inside thisRange.
			// We will cover that moveRange later. Right now we simply join the ranges and transform them as one.
			if ( differenceSet.length == 2 ) {
				difference.end = differenceSet[ 1 ].end.clone();
			}

			// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
			// Take the start and the end of the range and transform them by deletion of moved nodes.
			// Note that if moveRange was inside thisRange, only difference.end will be transformed.
			// This nicely covers the joining simplification we did in the previous step.
			difference.start = difference.start.getTransformedByDeletion( move.sourcePosition, move.howMany );
			difference.end = difference.end.getTransformedByDeletion( move.sourcePosition, move.howMany );

			// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
			// Note that since we operate on transformed difference range, we should transform by
			// previously transformed target position.
			ranges = difference.getTransformedByInsertion( moveTargetPosition, move.howMany, true );
		}

		// Then, we have to manage the common part of both move ranges.
		// If MoveOperations has common range it can be one of two:
		// * on the same tree level - it means that we move the same nodes into different places
		// * on deeper tree level - it means that we move nodes that are inside moved nodes
		// The operations are conflicting only if they try to explicitly move same nodes, so only in the first case.
		// So, we will handle common range if it is deeper or if this operation is more important.
		if ( utils.compareArrays( move.sourcePosition.parentPath, this.sourcePosition.parentPath ) == utils.compareArrays.PREFIX || isStrong ) {
			const common = thisRange.getCommon( moveRange );

			if ( common !== null ) {
				// We substitute original position by the combination of target position and original position.
				// This reflects that those nodes were moved to another place by MoveOperation.
				common.start = common.start.getCombined( move.sourcePosition, moveTargetPosition );
				common.end = common.end.getCombined( move.sourcePosition, moveTargetPosition );

				ranges.push( common );
			}
		}

		// At this point we transformed this operation's source range. Now, we need to transform target position.

		// First, transform target position by deletion of the other operation's range.
		let newTargetPosition = this.targetPosition.getTransformedByDeletion( move.sourcePosition, move.howMany );

		if ( newTargetPosition === null ) {
			// This operation's target position was inside a node moved by the other MoveOperation.
			// We substitute that position by the combination of the other move target position and this target position.
			// This reflects changes done by the other MoveOperation.

			newTargetPosition = this.targetPosition.getCombined( move.sourcePosition, moveTargetPosition );
		} else {
			// Here we have the target position after some nodes has been removed by MoveOperation.
			// Next step is to reflect pasting nodes by MoveOperation, which might further affect the position.

			newTargetPosition = newTargetPosition.getTransformedByInsertion( moveTargetPosition, move.howMany, true );
		}

		// If we haven't got any ranges this far it means that both operations tried to move the same nodes and
		// this operation is less important. We return NoOperation in this case.
		if ( ranges.length === 0 ) {
			return [ new NoOperation( this.baseVersion + 1 ) ];
		}

		// At this point we might have multiple ranges. All those ranges will be moved to newTargetPosition.
		// To keep them in the right order, we need to move them starting from the last one.
		// [|ABC||DEF||GHI|] ==> [^], [|ABC||DEF|] ==> [^GHI], [|ABC|] ==> [^DEFGHI], [] ==> [ABCDEFGHI]
		// To achieve this, we sort ranges by their starting position in descending order.
		ranges.sort( ( a, b ) => b.start.compareWith( a.start ) );

		// Map transformed range(s) to operations and return them.
		return ranges.map( ( range, i ) => {
			return new MoveOperation(
				range.start,
				newTargetPosition,
				range.end.offset - range.start.offset,
				this.baseVersion + i + 1
			);
		} );
	}

	// Checks whether this MoveOperation targetPosition is inside a node from the source range of given MoveOperation.
	function _targetsIntoMoveOperation( operation ) {
		/*jshint validthis:true */

		return this.targetPosition.getTransformedByDeletion( operation.sourcePosition, operation.howMany ) === null;
	}

	return MoveOperation;
} );
