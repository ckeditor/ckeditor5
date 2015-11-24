/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'document/range',
	'document/operation/nooperation',
	'ckeditorerror',
	'document/operation/moveoperation',
	'document/operation/insertoperation'
], ( Operation, Range, NoOperation, CKEditorError ) => {
	/**
	 * Operation to change nodes' attribute. Using this class you can add, remove or change value of the attribute.
	 *
	 * @class document.operation.ChangeOperation
	 */
	class ChangeOperation extends Operation {
		/**
		 * Creates a change operation.
		 *
		 * If only the new attribute is set, then it will be inserted. Note that in all nodes in ranges there must be
		 * no attributes with the same key as the new attribute.
		 *
		 * If only the old attribute is set, then it will be removed. Note that this attribute must be present in all nodes in
		 * ranges.
		 *
		 * If both new and old attributes are set, then the operation will change the attribute value. Note that both new and
		 * old attributes have to have the same key and the old attribute must be present in all nodes in ranges.
		 *
		 * @param {document.Range} range Range on which the operation should be applied.
		 * @param {document.Attribute|null} oldAttr Attribute to be removed. If `null`, then the operation just inserts a new attribute.
		 * @param {document.Attribute|null} newAttr Attribute to be added. If `null`, then the operation just removes the attribute.
		 * @param {Number} baseVersion {@link document.Document#version} on which the operation can be applied.
		 * @constructor
		 */
		constructor( range, oldAttr, newAttr, baseVersion ) {
			super( baseVersion );

			/**
			 * Range on which operation should be applied.
			 *
			 * @readonly
			 * @type {document.Range}
			 */
			this.range = range;

			/**
			 * Old attribute to change. Set to `null` if operation inserts a new attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.oldAttr = oldAttr;

			/**
			 * New attribute. Set to `null` if operation removes the attribute.
			 *
			 * @readonly
			 * @type {document.Attribute|null}
			 */
			this.newAttr = newAttr;
		}

		_execute() {
			const oldAttr = this.oldAttr;
			const newAttr = this.newAttr;
			let value;

			if ( oldAttr !== null && newAttr !== null && oldAttr.key != newAttr.key ) {
				/**
				 * Old and new attributes should have the same keys.
				 *
				 * @error operation-change-different-keys
				 * @param {document.Attribute} oldAttr
				 * @param {document.Attribute} newAttr
				 */
				throw new CKEditorError(
					'operation-change-different-keys: Old and new attributes should have the same keys.',
					{ oldAttr: oldAttr, newAttr: newAttr } );
			}

			// Remove or change.
			if ( oldAttr !== null && newAttr === null ) {
				for ( value of this.range ) {
					value.node.removeAttr( oldAttr.key );
				}
			}

			// Insert or change.
			if ( newAttr !== null ) {
				for ( value of this.range ) {
					value.node.setAttr( newAttr );
				}
			}
		}

		getReversed() {
			return new ChangeOperation( this.range, this.newAttr, this.oldAttr, this.baseVersion + 1 );
		}

		getTransformedBy( operation, isStrong ) {
			// Circular dependency re-require.
			const InsertOperation = CKEDITOR.require( 'document/operation/insertoperation' );
			const MoveOperation = CKEDITOR.require( 'document/operation/moveoperation' );

			if ( operation instanceof InsertOperation ) {
				return getTransformedByInsertOperation.call( this, operation, !!isStrong );
			} else if ( operation instanceof MoveOperation ) {
				return getTransformedByMoveOperation.call( this, operation, !!isStrong );
			} else if ( operation instanceof ChangeOperation ) {
				return getTransformedByChangeOperation.call( this, operation, !!isStrong );
			}

			return [ this.clone( this.baseVersion + 1 ) ];
		}

		clone( baseVersion ) {
			if ( !baseVersion ) {
				baseVersion = this.baseVersion;
			}

			return new ChangeOperation( this.range.clone(), this.oldAttr, this.newAttr, baseVersion );
		}

		/**
		 * Checks whether this operation has conflicting attributes with given {@link document.operation.ChangeOperation}.
		 * This happens when both operations changes an attribute with the same key and they either set different
		 * values for this attribute or one of them removes it while the other one sets it.
		 *
		 * @param {document.operation.ChangeOperation} otherOperation Operation to check against.
		 * @returns {boolean} True if operations have conflicting attributes.
		 */
		conflictsAttributesWith( otherOperation ) {
			// Keeping in mind that newAttr or oldAttr might be null.
			// We will retrieve the key from whichever parameter is set.
			const thisKey = ( this.newAttr || this.oldAttr ).key;
			const otherKey = ( otherOperation.newAttr || otherOperation.oldAttr ).key;

			if ( thisKey != otherKey ) {
				// Different keys - not conflicting.
				return false;
			}

			// Check if they set different value or one of them removes the attribute.
			return ( this.newAttr === null && otherOperation.newAttr !== null ) ||
				( this.newAttr !== null && otherOperation.newAttr === null ) ||
				( !this.newAttr.isEqual( otherOperation.newAttr ) );
		}
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.InsertOperation}.
	 *
	 * @method getTransformedByInsertOperation
	 * @param {document.operation.InsertOperation} insert Operation to transform by.
	 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByInsertOperation( insert ) {
		/*jshint validthis:true */

		// Transform this operation's range.
		const ranges = this.range.getTransformedByInsertion( insert.position, insert.nodeList.length );

		// Map transformed range(s) to operations and return them.
		return ranges.map( ( range, i ) => {
			return new ChangeOperation(
				range,
				this.oldAttr,
				this.newAttr,
				this.baseVersion + i + 1
			);
		} );
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.MoveOperation}.
	 *
	 * @method getTransformedByRangeMove
	 * @param {document.operation.MoveOperation} move Operation to transform by.
	 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByMoveOperation( move ) {
		/*jshint validthis:true */

		// Convert MoveOperation properties into a range.
		const moveRange = Range.createFromPositionAndOffset( move.sourcePosition, move.howMany );

		// Get a target position from a state "after" nodes from moveRange are "detached".
		const newTargetPosition = move.targetPosition.getTransformedByDeletion( move.sourcePosition, move.howMany );

		// This will aggregate transformed ranges.
		let ranges = [];

		const differenceSet = this.range.getDifference( moveRange );
		const common = this.range.getCommon( moveRange );

		// Difference is the range(s) that are modified by this operation but are not affected by MoveOperation.
		if ( differenceSet.length > 0 ) {
			const difference = differenceSet[ 0 ];

			// If two ranges were returned it means that moveRange was inside this operation range.
			// We will cover that moveRange later. Right now we simply join the ranges and transform them as one.
			if ( differenceSet.length == 2 ) {
				difference.end = differenceSet[ 1 ].end.clone();
			}

			// MoveOperation removes nodes from their original position. We acknowledge this by proper transformation.
			// Take the start and the end of the range and transform them by deletion of moved nodes.
			// Note that if moveRange was inside ChangeOperation range, only difference.end will be transformed.
			// This nicely covers the joining simplification we did in the previous step.
			difference.start = difference.start.getTransformedByDeletion( move.sourcePosition, move.howMany );
			difference.end = difference.end.getTransformedByDeletion( move.sourcePosition, move.howMany );

			// MoveOperation pastes nodes into target position. We acknowledge this by proper transformation.
			// Note that since we operate on transformed difference range, we should transform by
			// previously transformed target position.
			ranges = difference.getTransformedByInsertion( newTargetPosition, move.howMany, false );
		}

		// Common is a range of nodes that is affected by MoveOperation. So it got moved to other place.
		if ( common !== null ) {
			// We substitute original position by the combination of target position and original position.
			// This reflects that those nodes were moved to another place by MoveOperation.
			common.start = common.start.getCombined( move.sourcePosition, newTargetPosition );
			common.end = common.end.getCombined( move.sourcePosition, newTargetPosition );

			ranges.push( common );
		}

		// Map transformed range(s) to operations and return them.
		return ranges.map( ( range, i ) => {
			return new ChangeOperation(
				range,
				this.oldAttr,
				this.newAttr,
				this.baseVersion + i + 1
			);
		} );
	}

	/**
	 * Returns an array containing the result of transforming this operation by given {document.operation.ChangeOperation}.
	 *
	 * @method getTransformedByChangeOperation
	 * @param {document.operation.ChangeOperation} change Operation to transform by.
	 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
	 * when resolving conflicts.
	 * @returns {Array.<document.operation.ChangeOperation>} Result of the transformation.
	 * @private
	 */
	function getTransformedByChangeOperation( change, isStrong ) {
		/*jshint validthis:true */

		if ( this.conflictsAttributesWith( change ) && !isStrong ) {
			// If operations' attributes are in conflict and this operation is less important
			// we have to check if operations' ranges intersect and manage them properly.

			// We get the range(s) which are only affected by this operation.
			const ranges = this.range.getDifference( change.range );

			if ( ranges.length === 0 ) {
				// If there are no such ranges, this operation should not do anything (as it is less important).
				return [ new NoOperation( this.baseVersion + 1 ) ];
			} else {
				// If there are such ranges, map them to operations and then return.
				return ranges.map( ( range, i ) => {
					return new ChangeOperation(
						range,
						this.oldAttr,
						this.newAttr,
						this.baseVersion + i + 1
					);
				} );
			}
		} else {
			// If operations don't conflict or this operation is more important
			// simply, return an array containing just a clone of this operation.
			return [ this.clone( this.baseVersion + 1 ) ];
		}
	}

	return ChangeOperation;
} );
