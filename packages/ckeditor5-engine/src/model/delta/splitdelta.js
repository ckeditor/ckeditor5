/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/splitdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import MoveOperation from '../operation/moveoperation';
import MergeDelta from '../delta/mergedelta';

/**
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/writer~Writer#split} method
 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class SplitDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'split';
	}

	/**
	 * Position of split or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * Operation in the delta that adds to model an element into which split nodes will be moved, or `null` if
	 * there are no operations in the delta.
	 *
	 * Most commonly this will be {@link module:engine/model/operation/insertoperation~InsertOperation an insert operation},
	 * as `SplitDelta` has to create a new node. If `SplitDelta` was created through
	 * {@link module:engine/model/delta/delta~Delta#getReversed reversing}
	 * a {@link module:engine/model/delta/mergedelta~MergeDelta merge delta},
	 * this will be a {@link module:engine/model/operation/reinsertoperation~ReinsertOperation reinsert operation},
	 * as we will want to re-insert the exact element that was removed by that merge delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|
	 * module:engine/model/operation/reinsertoperation~ReinsertOperation|null}
	 */
	get _cloneOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation in the delta that moves model items, that are after split position, to their new parent or `null`
	 * if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] && this.operations[ 1 ] instanceof MoveOperation ? this.operations[ 1 ] : null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return MergeDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.SplitDelta';
	}
}

DeltaFactory.register( SplitDelta );
