/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/delta/delta',
	'treemodel/delta/register',
	'treemodel/operation/moveoperation',
	'treemodel/position',
	'treemodel/range'
], ( Delta, register, MoveOperation, Position, Range ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#move} method
	 * uses the `MoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.MoveDelta
	 */
	class MoveDelta extends Delta {}

	function addMoveOperation( batch, delta, sourcePosition, howMany, targetPosition ) {
		const operation = new MoveOperation( sourcePosition, howMany, targetPosition, batch.doc.version );
		batch.doc.applyOperation( operation );
		delta.addOperation( operation );
	}

	/**
	 * Moves given node or given range of nodes to target position.
	 *
	 * @chainable
	 * @method move
	 * @memberOf treeModel.Batch
	 * @param {treeModel.Node|treeModel.Range} nodeOrRange Node or range of nodes to move.
	 * @param {treeModel.Position} targetPosition Position where moved nodes will be inserted.
	 */
	register( 'move', function( nodeOrRange, targetPosition ) {
		const delta = new MoveDelta();
		let ranges;

		if ( nodeOrRange instanceof Range ) {
			// The array is reversed, so the furthest ranges get moved first.
			// This will keep the order of nodes in ranges correct.
			// It's like using .pop() + .unshift() when moving elements between arrays.
			ranges = nodeOrRange.getMinimalFlatRanges().reverse();

			for ( let flat of ranges ) {
				addMoveOperation( this, delta, flat.start, flat.end.offset - flat.start.offset, targetPosition );
			}
		} else {
			addMoveOperation( this, delta, Position.createBefore( nodeOrRange ), 1, targetPosition );
		}

		this.addDelta( delta );

		return this;
	} );

	return MoveDelta;
} );
