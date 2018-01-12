/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/wrapdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import UnwrapDelta from './unwrapdelta';
import Range from '../range';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/writer~Writer#merge} method
 * uses the `WrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class WrapDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'wrap';
	}

	/**
	 * Range to wrap or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/range~Range|null}
	 */
	get range() {
		const moveOp = this._moveOperation;

		return moveOp ? Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany ) : null;
	}

	/**
	 * Offset size of range to wrap by the delta or `null` if there are no operations in delta.
	 *
	 * @type {Number}
	 */
	get howMany() {
		const range = this.range;

		return range ? range.end.offset - range.start.offset : 0;
	}

	/* eslint-disable max-len */
	/**
	 * Operation that inserts wrapping element or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|module:engine/model/operation/reinsertoperation~ReinsertOperation}
	 */
	/* eslint-enable max-len */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation that moves wrapped nodes to their new parent or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return UnwrapDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.WrapDelta';
	}
}

DeltaFactory.register( WrapDelta );
