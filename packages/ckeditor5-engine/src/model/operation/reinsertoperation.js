/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/reinsertoperation
 */

import MoveOperation from './moveoperation';
import RemoveOperation from './removeoperation';

/**
 * Operation to reinsert previously removed nodes back to the non-graveyard root. This operation acts like
 * {@link module:engine/model/operation/moveoperation~MoveOperation} but it returns
 * {@link module:engine/model/operation/removeoperation~RemoveOperation} when reversed
 * and fires different change event.
 */
export default class ReinsertOperation extends MoveOperation {
	/**
	 * Position where nodes will be re-inserted.
	 *
	 * @type {module:engine/model/position~Position}
	 */
	get position() {
		return this.targetPosition;
	}

	/**
	 * @param {module:engine/model/position~Position} pos
	 */
	set position( pos ) {
		this.targetPosition = pos;
	}

	/**
	 * @inheritDoc
	 */
	get type() {
		return 'reinsert';
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/removeoperation~RemoveOperation}
	 */
	getReversed() {
		const newTargetPosition = this.sourcePosition._getTransformedByInsertion( this.targetPosition, this.howMany );

		return new RemoveOperation( this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.ReinsertOperation';
	}
}
