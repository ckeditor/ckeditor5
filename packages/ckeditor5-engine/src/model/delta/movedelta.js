/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import { register } from '../batch.js';
import MoveOperation from '../operation/moveoperation.js';
import Position from '../position.js';
import Range from '../range.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link engine.model.Batch#move} method
 * uses the `MoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class MoveDelta extends Delta {
	/**
	 * Offset size of moved range or `null` if there are no operations in the delta.
	 *
	 * @type {Number|null}
	 */
	get howMany() {
		return this._moveOperation ? this._moveOperation.howMany : null;
	}

	/**
	 * {@link engine.model.delta.MoveDelta#_moveOperation Move operation}
	 * {@link engine.model.operation.MoveOperation#sourcePosition source position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {engine.model.Position|null}
	 */
	get sourcePosition() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * {@link engine.model.delta.MoveDelta#_moveOperation Move operation}
	 * {@link engine.model.operation.MoveOperation#targetPosition target position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {engine.model.Position|null}
	 */
	get targetPosition() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * {@link engine.model.delta.MoveDelta#_moveOperation Move operation} that is saved in this delta or `null`
	 * if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.model.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return MoveDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.MoveDelta';
	}

	/**
	 * @inheritDoc
	 */
	static get _priority() {
		return 20;
	}
}

function addMoveOperation( batch, delta, sourcePosition, howMany, targetPosition ) {
	const operation = new MoveOperation( sourcePosition, howMany, targetPosition, batch.document.version );
	delta.addOperation( operation );
	batch.document.applyOperation( operation );
}

/**
 * Moves given {@link engine.model.Item model item} or given range to target position.
 *
 * @chainable
 * @method engine.model.Batch#move
 * @param {engine.model.Item|engine.model.Range} itemOrRange Model item or range of nodes to move.
 * @param {engine.model.Position} targetPosition Position where moved nodes will be inserted.
 */
register( 'move', function( itemOrRange, targetPosition ) {
	const delta = new MoveDelta();
	this.addDelta( delta );

	if ( itemOrRange instanceof Range ) {
		if ( !itemOrRange.isFlat ) {
			/**
			 * Range to move is not flat.
			 *
			 * @error batch-move-range-not-flat
			 */
			throw new CKEditorError( 'batch-move-range-not-flat: Range to move is not flat.' );
		}

		addMoveOperation( this, delta, itemOrRange.start, itemOrRange.end.offset - itemOrRange.start.offset, targetPosition );
	} else {
		addMoveOperation( this, delta, Position.createBefore( itemOrRange ), 1, targetPosition );
	}

	return this;
} );

DeltaFactory.register( MoveDelta );
