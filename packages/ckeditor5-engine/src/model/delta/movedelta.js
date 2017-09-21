/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/movedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import { register } from '../batch';
import MoveOperation from '../operation/moveoperation';
import Position from '../position';
import Range from '../range';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/batch~Batch#move} method
 * uses the `MoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class MoveDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'move';
	}

	/**
	 * Offset size of moved range or `null` if there are no operations in the delta.
	 *
	 * @type {Number|null}
	 */
	get howMany() {
		return this._moveOperation ? this._moveOperation.howMany : null;
	}

	/**
	 * {@link module:engine/model/delta/movedelta~MoveDelta#_moveOperation Move operation}
	 * {@link module:engine/model/operation/moveoperation~MoveOperation#sourcePosition source position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get sourcePosition() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * {@link module:engine/model/delta/movedelta~MoveDelta#_moveOperation Move operation}
	 * {@link module:engine/model/operation/moveoperation~MoveOperation#targetPosition target position} or `null` if there are
	 * no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get targetPosition() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * {@link module:engine/model/delta/movedelta~MoveDelta#_moveOperation Move operation} that is saved in this delta or `null`
	 * if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
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
}

function addMoveOperation( batch, delta, sourcePosition, howMany, targetPosition ) {
	const operation = new MoveOperation( sourcePosition, howMany, targetPosition, batch.document.version );
	delta.addOperation( operation );
	batch.document.applyOperation( operation );
}

/**
 * Moves given {@link module:engine/model/item~Item model item} or given range to target position.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#move
 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange Model item or range of nodes to move.
 * @param {module:engine/model/position~Position} targetPosition Position where moved nodes will be inserted.
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
