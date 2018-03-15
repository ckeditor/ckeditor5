/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/removedelta
 */

import MoveDelta from './movedelta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/writer~Writer#remove} method
 * uses the `RemoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class RemoveDelta extends MoveDelta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RemoveDelta';
	}
}

DeltaFactory.register( RemoveDelta );
