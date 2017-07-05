/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/removeoperation
 */

import MoveOperation from './moveoperation';
import ReinsertOperation from './reinsertoperation';

/**
 * Operation to remove a range of nodes.
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'remove';
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/reinsertoperation~ReinsertOperation|module:engine/model/operation/nooperation~NoOperation}
	 */
	getReversed() {
		const newTargetPosition = this.sourcePosition._getTransformedByInsertion( this.targetPosition, this.howMany );

		return new ReinsertOperation( this.getMovedRangeStart(), this.howMany, newTargetPosition, this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RemoveOperation';
	}
}
