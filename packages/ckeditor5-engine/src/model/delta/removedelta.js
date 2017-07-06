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

function addRemoveDelta( batch, position, howMany ) {
	const delta = new RemoveDelta();
	batch.addDelta( delta );

	const graveyard = batch.document.graveyard;
	const gyPosition = new Position( graveyard, [ 0 ] );

	const operation = new RemoveOperation( position, howMany, gyPosition, batch.document.version );
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
	if ( itemOrRange instanceof Range ) {
		// The array is reversed, so the ranges to remove are in correct order and do not have to be updated.
		const ranges = itemOrRange.getMinimalFlatRanges().reverse();

		for ( const flat of ranges ) {
			addRemoveDelta( this, flat.start, flat.end.offset - flat.start.offset );
		}
	} else {
		addRemoveDelta( this, Position.createBefore( itemOrRange ), 1 );
	}

	return this;
} );

DeltaFactory.register( RemoveDelta );
