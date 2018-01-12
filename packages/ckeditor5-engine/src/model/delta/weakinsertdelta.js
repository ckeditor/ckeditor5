/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/weakinsertdelta
 */

import InsertDelta from './insertdelta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/writer~Writer#insert} method
 * uses the `WeakInsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class WeakInsertDelta extends InsertDelta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.WeakInsertDelta';
	}
}

DeltaFactory.register( WeakInsertDelta );
