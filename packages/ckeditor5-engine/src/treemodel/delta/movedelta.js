/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import { register } from '../batch-base.js';
import MoveOperation from '../operation/moveoperation.js';
import Position from '../position.js';
import Range from '../range.js';
import CKEditorError from '../../ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link core.treeModel.Batch#move} method
 * uses the `MoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @class core.treeModel.delta.MoveDelta
 */
export default class MoveDelta extends Delta {}

function addMoveOperation( batch, delta, sourcePosition, howMany, targetPosition ) {
	const operation = new MoveOperation( sourcePosition, howMany, targetPosition, batch.doc.version );
	batch.doc.applyOperation( operation );
	delta.addOperation( operation );
}

/**
 * Moves given node or given range of nodes to target position.
 *
 * @chainable
 * @method core.treeModel.Batch#move
 * @param {core.treeModel.Node|core.treeModel.Range} nodeOrRange Node or range of nodes to move.
 * @param {core.treeModel.Position} targetPosition Position where moved nodes will be inserted.
 */
register( 'move', function( nodeOrRange, targetPosition ) {
	const delta = new MoveDelta();

	if ( nodeOrRange instanceof Range ) {
		if ( !nodeOrRange.isFlat ) {
			/**
			 * Range to move is not flat.
			 *
			 * @error batch-move-range-not-flat
			 */
			throw new CKEditorError( 'batch-move-range-not-flat: Range to move is not flat.' );
		}

		addMoveOperation( this, delta, nodeOrRange.start, nodeOrRange.end.offset - nodeOrRange.start.offset, targetPosition );
	} else {
		addMoveOperation( this, delta, Position.createBefore( nodeOrRange ), 1, targetPosition );
	}

	this.addDelta( delta );

	return this;
} );
