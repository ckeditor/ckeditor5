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
	 * @inheritDoc
	 * @returns {module:engine/model/operation/removeoperation~RemoveOperation}
	 */
	getReversed() {
		const removeOp = new RemoveOperation( this.targetPosition, this.howMany, this.baseVersion + 1 );

		// Make sure that nodes are put back into the `$graveyardHolder` from which they got reinserted.
		removeOp.targetPosition = this.sourcePosition;
		removeOp._needsHolderElement = false;

		return removeOp;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.ReinsertOperation';
	}
}
