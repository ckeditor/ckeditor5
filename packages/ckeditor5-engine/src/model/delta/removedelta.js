/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/removedelta
 */

import MoveDelta from './movedelta';
import { register } from '../batch';
import DeltaFactory from './deltafactory';
import RemoveOperation from '../operation/removeoperation';
import Position from '../position';
import Range from '../range';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/batch~Batch#remove} method
 * uses the `RemoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class RemoveDelta extends MoveDelta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RemoveDelta';
	}
}

function addRemoveOperation( batch, delta, position, howMany ) {
	const operation = new RemoveOperation( position, howMany, batch.document.version );
	delta.addOperation( operation );
	batch.document.applyOperation( operation );
}

/**
 * Removes given {@link module:engine/model/item~Item model item} or given range.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#remove
 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange Model item or range to remove.
 */
register( 'remove', function( itemOrRange ) {
	const delta = new RemoveDelta();
	this.addDelta( delta );

	if ( itemOrRange instanceof Range ) {
		// The array is reversed, so the ranges are correct and do not have to be updated.
		const ranges = itemOrRange.getMinimalFlatRanges().reverse();

		for ( const flat of ranges ) {
			addRemoveOperation( this, delta, flat.start, flat.end.offset - flat.start.offset );
		}
	} else {
		addRemoveOperation( this, delta, Position.createBefore( itemOrRange ), 1 );
	}

	return this;
} );

DeltaFactory.register( RemoveDelta );
