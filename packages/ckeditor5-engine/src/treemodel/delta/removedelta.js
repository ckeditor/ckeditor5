/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import register from './register.js';
import RemoveOperation from '../operation/removeoperation.js';
import Position from '../position.js';
import Range from '../range.js';

/**
 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#remove} method
 * uses the `RemoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @class treeModel.delta.RemoveDelta
 */
export default class RemoveDelta extends Delta {}

function addRemoveOperation( batch, delta, position, howMany ) {
	const operation = new RemoveOperation( position, howMany, batch.doc.version );
	batch.doc.applyOperation( operation );
	delta.addOperation( operation );
}

/**
 * Removes given node or range of nodes.
 *
 * @chainable
 * @method remove
 * @memberOf treeModel.Batch
 * @param {treeModel.Node|treeModel.Range} nodeOrRange Node or range of nodes to remove.
 */
register( 'remove', function( nodeOrRange ) {
	const delta = new RemoveDelta();

	if ( nodeOrRange instanceof Range ) {
		// The array is reversed, so the ranges are correct and do not have to be updated.
		let ranges = nodeOrRange.getMinimalFlatRanges().reverse();

		for ( let flat of ranges ) {
			addRemoveOperation( this, delta, flat.start, flat.end.offset - flat.start.offset );
		}
	} else {
		addRemoveOperation( this, delta, Position.createBefore( nodeOrRange ), 1 );
	}

	this.addDelta( delta );

	return this;
} );
