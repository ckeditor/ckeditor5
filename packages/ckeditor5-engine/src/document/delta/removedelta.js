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
	 * @class document.delta.RemoveDelta
	 */
	class RemoveDelta extends Delta {}

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