/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/renamedelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/writer~Writer#rename Batch#rename} method
 * uses the `RenameDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class RenameDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'rename';
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return RenameDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RenameDelta';
	}
}

DeltaFactory.register( RenameDelta );
