/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { default as Delta, registerDeserializer } from './delta.js';
import { register } from '../batch.js';
import MoveOperation from '../operation/moveoperation.js';
import Position from '../position.js';
import Range from '../range.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link engine.treeModel.Batch#move} method
 * uses the `MoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.treeModel.delta
 */
export default class MoveDelta extends Delta {
	/**
	 * How many nodes are moved by the delta or `null` if there are no operations in the delta.
	 *
	 * @type {Number|null}
	 */
	get howMany() {
		return this._moveOperation ? this._moveOperation.howMany : null;
	}

	/**
	 * {@link engine.treeModel.delta.MoveDelta#_moveOperation Move operation}
	 * {@link engine.treeModel.operation.MoveOperation#sourcePosition source position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {engine.treeModel.Position|null}
	 */
	get sourcePosition() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * {@link engine.treeModel.delta.MoveDelta#_moveOperation Move operation}
	 * {@link engine.treeModel.operation.MoveOperation#targetPosition target position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {engine.treeModel.Position|null}
	 */
	get targetPosition() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * Move operation that is saved in this delta or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.treeModel.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 0 ] || null;
	}

	get _reverseDeltaClass() {
		return MoveDelta;
	}

	/** @inheritDoc */
	static get className() {
		return 'engine.treeModel.delta.MoveDelta';
	}

	static get _priority() {
		return 20;
	}
}

function addMoveOperation( batch, delta, sourcePosition, howMany, targetPosition ) {
	const operation = new MoveOperation( sourcePosition, howMany, targetPosition, batch.doc.version );
	delta.addOperation( operation );
	batch.doc.applyOperation( operation );
}

/**
 * Moves given node or given range of nodes to target position.
 *
 * @chainable
 * @method engine.treeModel.Batch#move
 * @param {engine.treeModel.Node|engine.treeModel.Range} nodeOrRange Node or range of nodes to move.
 * @param {engine.treeModel.Position} targetPosition Position where moved nodes will be inserted.
 */
register( 'move', function( nodeOrRange, targetPosition ) {
	const delta = new MoveDelta();
	this.addDelta( delta );

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

	return this;
} );

registerDeserializer( MoveDelta.className, MoveDelta );
