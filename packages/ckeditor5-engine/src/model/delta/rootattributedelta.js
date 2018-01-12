/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/rootattributedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, methods to change attributes
 * ({@link module:engine/model/writer~Writer#setAttribute} and {@link module:engine/model/writer~Writer#removeAttribute})
 * use `RootAttributeDelta` class which inherits from the `Delta` class and may
 * overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class RootAttributeDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RootAttributeDelta';
	}
}

DeltaFactory.register( RootAttributeDelta );
