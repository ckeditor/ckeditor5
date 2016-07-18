/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import MoveOperation from './moveoperation.js';
import RemoveOperation from './removeoperation.js';

/**
 * Operation to reinsert previously removed nodes back to the non-graveyard root. This operation acts like
 * {@link engine.model.operation.MoveOperation} but it returns {@link engine.model.operation.RemoveOperation} when reversed
 * and fires different change event.
 *
 * @memberOf engine.model.operation
 */
export default class ReinsertOperation extends MoveOperation {
	/**
	 * Position where nodes will be re-inserted.
	 *
	 * @type {engine.model.Position}
	 */
	get position() {
		return this.targetPosition;
	}

	/**
	 * @param {engine.model.Position} pos
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
	 * @returns {engine.model.operation.RemoveOperation}
	 */
	getReversed() {
		return new RemoveOperation( this.targetPosition, this.howMany, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.ReinsertOperation';
	}

}
