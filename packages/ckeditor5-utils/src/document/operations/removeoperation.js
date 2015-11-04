/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operations/moveoperation',
	'document/position',
	'document/operations/reinsertoperation'
], function( MoveOperation, Position ) {
	/**
	 * Operation to remove a range of nodes.
	 *
	 * @class document.operations.RemoveOperation
	 */
	class RemoveOperation extends MoveOperation {
		/**
		 * Creates a remove operation.
		 *
		 * @param {document.Position} position Position before the first node to remove.
		 * @param {Number} howMany How many nodes to remove.
		 * @param {Number} baseVersion {@link document.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( position, howMany, baseVersion ) {
			var graveyard = position.root.document._graveyard;

			/**
			 * Position in a graveyard where nodes were moved.
			 */
			var graveyardPosition = Position.createFromParentAndOffset( graveyard, 0 );

			super( position, graveyardPosition, howMany, baseVersion );
		}

		/**
		 * See {@link document.operations.Operation#getReversed}.
		 */
		getReversed() {
			// Because of circular dependencies we need to re-require reinsert operation here.
			var ReinsertOperation = CKEDITOR.require( 'document/operations/reinsertoperation' );

			return new ReinsertOperation( this.targetPosition, this.sourcePosition, this.howMany, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );
