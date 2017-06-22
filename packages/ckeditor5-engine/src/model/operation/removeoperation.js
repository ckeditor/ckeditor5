/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/removeoperation
 */

import MoveOperation from './moveoperation';
import ReinsertOperation from './reinsertoperation';
import NoOperation from './nooperation';

/**
 * Operation to remove a range of nodes.
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 * Creates a remove operation.
	 *
	 * @param {module:engine/model/position~Position} sourcePosition Position before the first
	 * {@link module:engine/model/item~Item model item} to move.
	 * @param {Number} howMany Offset size of moved range. Moved range will start from `sourcePosition` and end at
	 * `sourcePosition` with offset shifted by `howMany`.
	 * @param {module:engine/model/position~Position} targetPosition Position at which moved nodes will be inserted.
	 * @param {Number} baseVersion {@link module:engine/model/document~Document#version} on which operation can be applied.
	 */
	constructor( sourcePosition, howMany, targetPosition, baseVersion ) {
		super( sourcePosition, howMany, targetPosition, baseVersion );

		/**
		 * If `RemoveOperation` is permanent (`true`), nodes removed by it cannot be reinserted back to the model. This
		 * setting affects operational transformation and {@link #getReversed reversing}.
		 *
		 * @member {Boolean} module:engine/model/operation/removeoperation~RemoveOperation#isPermanent
		 */
		this.isPermanent = false;
	}

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
		if ( this.isPermanent ) {
			return new NoOperation( this.baseVersion + 1 );
		} else {
			return new ReinsertOperation( this.targetPosition, this.howMany, this.sourcePosition, this.baseVersion + 1 );
		}
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.RemoveOperation';
	}

	static fromJSON( json, document ) {
		const op = super.fromJSON( json, document );

		op.isPermanent = json.isPermanent;

		return op;
	}
}
