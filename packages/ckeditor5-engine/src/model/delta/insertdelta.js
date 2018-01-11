/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/insertdelta
 */

import Delta from './delta';
import RemoveDelta from './removedelta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/writer~Writer#insert Batch#insert} method
 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class InsertDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'insert';
	}

	/**
	 * Position where the delta inserts nodes or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._insertOperation ? this._insertOperation.position : null;
	}

	/**
	 * Node list containing all the nodes inserted by the delta or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @type {module:engine/model/nodelist~NodeList|null}
	 */
	get nodes() {
		return this._insertOperation ? this._insertOperation.nodes : null;
	}

	/**
	 * Insert operation that is saved in this delta or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|null}
	 */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return RemoveDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.InsertDelta';
	}
}

DeltaFactory.register( InsertDelta );
