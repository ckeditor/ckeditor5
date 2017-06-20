/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/moveoperation
 */

import Operation from './operation';
import Position from '../position';
import Range from '../range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import compareArrays from '@ckeditor/ckeditor5-utils/src/comparearrays';
import writer from './../writer';

/**
 * Operation to move a range of {@link module:engine/model/item~Item model items}
 * to given {@link module:engine/model/position~Position target position}.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class MoveOperation extends Operation {
	/**
	 * Creates a move operation.
	 *
	 * @param {module:engine/model/position~Position} sourcePosition
	 * Position before the first {@link module:engine/model/item~Item model item} to move.
	 * @param {Number} howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
	 * `sourcePosition` with offset shifted by `howMany`.
	 * @param {module:engine/model/position~Position} targetPosition Position at which moved nodes will be inserted.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which operation can be applied.
	 */
	constructor( sourcePosition, howMany, targetPosition, baseVersion ) {
		super( baseVersion );

		/**
		 * Position before the first {@link module:engine/model/item~Item model item} to move.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/moveoperation~MoveOperation#sourcePosition
		 */
		this.sourcePosition = Position.createFromPosition( sourcePosition );

		/**
		 * Offset size of moved range.
		 *
		 * @member {Number} module:engine/model/operation/moveoperation~MoveOperation#howMany
		 */
		this.howMany = howMany;

		/**
		 * Position at which moved nodes will be inserted.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/moveoperation~MoveOperation#targetPosition
		 */
		this.targetPosition = Position.createFromPosition( targetPosition );

		/**
		 * Defines whether `MoveOperation` is sticky. If `MoveOperation` is sticky, during
		 * {@link module:engine/model/operation/transform~transform operational transformation} if there will be an operation that
		 * inserts some nodes at the position equal to the boundary of this `MoveOperation`, that operation will
		 * get their insertion path updated to the position where this `MoveOperation` moves the range.
		 *
		 * @member {Boolean} module:engine/model/operation/moveoperation~MoveOperation#isSticky
		 */
		this.isSticky = false;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'move';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/moveoperation~MoveOperation} Clone of this operation.
	 */
	clone() {
		const op = new this.constructor( this.sourcePosition, this.howMany, this.targetPosition, this.baseVersion );
		op.isSticky = this.isSticky;

		return op;
	}

	/**
	 * Returns the start position of the moved range after it got moved. This may be different than
	 * {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition} in some cases, i.e. when a range is moved
	 * inside the same parent but {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition targetPosition}
	 * is after {@link module:engine/model/operation/moveoperation~MoveOperation#sourcePosition sourcePosition}.
	 *
	 *		 vv              vv
	 *		abcdefg ===> adefbcg
	 *		     ^          ^
	 *		     targetPos	movedRangeStart
	 *		     offset 6	offset 4
	 *
	 * @returns {module:engine/model/position~Position}
	 */
	getMovedRangeStart() {
		return this.targetPosition._getTransformedByDeletion( this.sourcePosition, this.howMany );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/moveoperation~MoveOperation}
	 */
	getReversed() {
		const newTargetPosition = this.sourcePosition._getTransformedByInsertion( this.targetPosition, this.howMany );

		const op = new this.constructor( this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion + 1 );
		op.isSticky = this.isSticky;

		return op;
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		const sourceElement = this.sourcePosition.parent;
		const targetElement = this.targetPosition.parent;
		const sourceOffset = this.sourcePosition.offset;
		const targetOffset = this.targetPosition.offset;

		// Validate whether move operation has correct parameters.
		// Validation is pretty complex but move operation is one of the core ways to manipulate the document state.
		// We expect that many errors might be connected with one of scenarios described below.
		if ( !sourceElement || !targetElement ) {
			/**
			 * Source position or target position is invalid.
			 *
			 * @error move-operation-position-invalid
			 */
			throw new CKEditorError(
				'move-operation-position-invalid: Source position or target position is invalid.'
			);
		} else if ( sourceOffset + this.howMany > sourceElement.maxOffset ) {
			/**
			 * The nodes which should be moved do not exist.
			 *
			 * @error move-operation-nodes-do-not-exist
			 */
			throw new CKEditorError(
				'move-operation-nodes-do-not-exist: The nodes which should be moved do not exist.'
			);
		} else if ( sourceElement === targetElement && sourceOffset < targetOffset && targetOffset < sourceOffset + this.howMany ) {
			/**
			 * Trying to move a range of nodes into the middle of that range.
			 *
			 * @error move-operation-range-into-itself
			 */
			throw new CKEditorError(
				'move-operation-range-into-itself: Trying to move a range of nodes to the inside of that range.'
			);
		} else if ( this.sourcePosition.root == this.targetPosition.root ) {
			if ( compareArrays( this.sourcePosition.getParentPath(), this.targetPosition.getParentPath() ) == 'prefix' ) {
				const i = this.sourcePosition.path.length - 1;

				if ( this.targetPosition.path[ i ] >= sourceOffset && this.targetPosition.path[ i ] < sourceOffset + this.howMany ) {
					/**
					 * Trying to move a range of nodes into one of nodes from that range.
					 *
					 * @error move-operation-node-into-itself
					 */
					throw new CKEditorError(
						'move-operation-node-into-itself: Trying to move a range of nodes into one of nodes from that range.'
					);
				}
			}
		}

		const range = writer.move( Range.createFromPositionAndShift( this.sourcePosition, this.howMany ), this.targetPosition );

		return {
			sourcePosition: this.sourcePosition,
			range
		};
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.MoveOperation';
	}

	/**
	 * Creates `MoveOperation` object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/moveoperation~MoveOperation}
	 */
	static fromJSON( json, document ) {
		const sourcePosition = Position.fromJSON( json.sourcePosition, document );
		const targetPosition = Position.fromJSON( json.targetPosition, document );

		const move = new this( sourcePosition, json.howMany, targetPosition, json.baseVersion );

		if ( json.isSticky ) {
			move.isSticky = true;
		}

		return move;
	}
}
