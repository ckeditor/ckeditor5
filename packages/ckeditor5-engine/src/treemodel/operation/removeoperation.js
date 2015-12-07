/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/operation/moveoperation',
	'treemodel/position',
	'treemodel/operation/reinsertoperation'
], ( MoveOperation, Position ) => {
	/**
	 * Operation to remove a range of nodes.
	 *
	 * @class treeModel.operation.RemoveOperation
	 */
	class RemoveOperation extends MoveOperation {
		/**
		 * Creates a remove operation.
		 *
		 * @param {treeModel.Position} position Position before the first node to remove.
		 * @param {Number} howMany How many nodes to remove.
		 * @param {Number} baseVersion {@link treeModel.Document#version} on which operation can be applied.
		 * @constructor
		 */
		constructor( position, howMany, baseVersion ) {
			// Position in a graveyard where nodes were moved.
			const graveyardPosition = Position.createFromParentAndOffset( position.root.document.graveyard, 0 );

			super( position, howMany, graveyardPosition, baseVersion );
		}

		get type() {
			return 'remove';
		}

		getReversed() {
			// Because of circular dependencies we need to re-require reinsert operation here.
			const ReinsertOperation = CKEDITOR.require( 'treemodel/operation/reinsertoperation' );

			return new ReinsertOperation( this.targetPosition, this.howMany, this.sourcePosition, this.baseVersion + 1 );
		}
	}

	return RemoveOperation;
} );
