/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation',
	'ckeditorerror',
	'utils'
], ( Operation, CKEditorError, utils ) => {
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

		clone() {
			return new MoveOperation( this.sourcePosition.clone(), this.targetPosition.clone(), this.howMany, this.baseVersion );
		}
	}

	return MoveOperation;
} );
