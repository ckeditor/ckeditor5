/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/movedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/writer~Writer#move} method
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

DeltaFactory.register( MoveDelta );
