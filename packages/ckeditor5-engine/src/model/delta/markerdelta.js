/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/markerdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';

/**
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/writer~Writer#setMarker Batch#setMarker}
 * and {@link module:engine/model/writer~Writer#removeMarker Batch#removeMarker} methods use the `MarkerDelta` class which inherits
 * from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class MarkerDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'marker';
	}

	/**
	 * A class that will be used when creating reversed delta.
	 *
	 * @private
	 * @type {Function}
	 */
	get _reverseDeltaClass() {
		return MarkerDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.MarkerDelta';
	}
}

DeltaFactory.register( MarkerDelta );
