/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/mergedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import SplitDelta from './splitdelta';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/writer~Writer#merge} method
 * uses the `MergeDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class MergeDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'merge';
	}

	/**
	 * Position between to merged nodes or `null` if the delta has no operations.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._removeOperation ? this._removeOperation.sourcePosition : null;
	}

	/**
	 * Operation in this delta that removes the node after merge position (which will be empty at that point) or
	 * `null` if the delta has no operations. Note, that after {@link module:engine/model/delta/transform~transform transformation}
	 * this might be an instance of {@link module:engine/model/operation/moveoperation~MoveOperation} instead of
	 * {@link module:engine/model/operation/removeoperation~RemoveOperation}.
	 *
	 * @readonly
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _removeOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return SplitDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.MergeDelta';
	}
}

DeltaFactory.register( MergeDelta );
