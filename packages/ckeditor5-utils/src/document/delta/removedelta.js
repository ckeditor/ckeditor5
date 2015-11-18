/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/delta',
	'document/delta/register',
	'document/operation/removeoperation'
], ( Delta, register, RemoveOperation ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link document.Transaction#remove} method
	 * use `RemoveDelta` class which inherit from `Delta` class and may overwrite some methods.
	 *
	 * @class document.delta.RemoveDelta
	 */
	class RemoveDelta extends Delta {}

	/**
	 * Remove nodes starting at the given position.
	 *
	 * @chainable
	 * @memberOf document.Transaction
	 * @method remove
	 * @param {document.Position} position Position before the first node to remove.
	 * @param {Number} howMany How many nodes to remove.
	 */
	register( 'remove', ( doc, transaction, position, howMany ) => {
		if ( typeof howMany !== 'number' ) {
			howMany = 1;
		}

		const delta = new RemoveDelta();

		const operation = new RemoveOperation( position, howMany, doc.version );
		doc.applyOperation( operation );
		delta.addOperation( operation );

		transaction.addDelta( delta );
	} );

	return RemoveDelta;
} );