/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/unwrapdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import WrapDelta from './wrapdelta';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/writer~Writer#merge} method
 * uses the `UnwrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class UnwrapDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'unwrap';
	}

	/**
	 * Position before unwrapped element or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * Operation in the delta that moves unwrapped nodes to their new parent or `null` if there are no operations in the delta.
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
		return WrapDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.UnwrapDelta';
	}
}

DeltaFactory.register( UnwrapDelta );
