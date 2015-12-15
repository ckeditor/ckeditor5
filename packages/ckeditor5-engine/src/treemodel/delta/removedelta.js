/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/delta/delta',
	'treemodel/delta/register',
	'treemodel/operation/removeoperation',
	'treemodel/position'
], ( Delta, register, RemoveOperation, Position ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#remove} method
	 * uses the `RemoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.RemoveDelta
	 */
	class RemoveDelta extends Delta {}

	function addRemoveOperation( batch, delta, position, howMany ) {
		const operation = new RemoveOperation( position, howMany, batch.doc.version );
		batch.doc.applyOperation( operation );
		delta.addOperation( operation );
	}

	/**
	 * Removes given node. Use this only when you have to remove one node (may contain children). If you want to remove
	 * multiple nodes, use {@link treeModel.Batch#removeFlat removeFlat} or {@link treeModel.Batch#remove remove} instead.
	 *
	 * @chainable
	 * @method removeNode
	 * @memberOf treeModel.Batch
	 * @param {treeModel.Node} node Node to remove.
	 */
	register( 'removeNode', function( node ) {
		const delta = new RemoveDelta();

		addRemoveOperation( this, delta, Position.createBefore( node ), 1 );

		this.addDelta( delta );

		return this;
	} );

	/**
	 * Removes given range of nodes.
	 *
	 * @chainable
	 * @method move
	 * @memberOf treeModel.Batch
	 * @param {treeModel.Range} range Range to remove.
	 */
	register( 'remove', function( range ) {
		const delta = new RemoveDelta();

		// The array is reversed, so the ranges are correct and do not have to be updated.
		let ranges = range.getMinimalFlatRanges().reverse();

		for ( let flat of ranges ) {
			addRemoveOperation( this, delta, flat.start, flat.end.offset - flat.start.offset );
		}

		this.addDelta( delta );

		return this;
	} );

	return RemoveDelta;
} );
