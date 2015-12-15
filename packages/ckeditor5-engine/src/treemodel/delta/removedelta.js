/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/delta/delta',
	'treemodel/delta/register',
	'treemodel/operation/removeoperation'
], ( Delta, register, RemoveOperation ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#remove} method
	 * uses the `RemoveDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.RemoveDelta
	 */
	class RemoveDelta extends Delta {}

	/**
	 * Removes nodes starting from the given position.
	 *
	 * @chainable
	 * @method remove
	 * @memberOf treeModel.Batch
	 * @param {treeModel.Position} position Position before the first node to remove.
	 * @param {Number} howMany How many nodes to remove.
	 */
	register( 'remove', function( position, howMany ) {
		if ( typeof howMany !== 'number' ) {
			howMany = 1;
		}

		const delta = new RemoveDelta();

		const operation = new RemoveOperation( position, howMany, this.doc.version );
		this.doc.applyOperation( operation );
		delta.addOperation( operation );

		this.addDelta( delta );

		return this;
	} );

	return RemoveDelta;
} );
