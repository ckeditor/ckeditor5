/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/deltas/delta',
	'document/deltas/register',
	'document/operations/changeoperation'
], ( Delta, register, ChangeOperation ) => {
	/**
	 * @class document.delta.ChangeDelta
	 */
	class ChangeDelta extends Delta {}

	register( 'setAttr', ( doc, transaction, attr, range ) => {
		var ops = [];
		var startPosition = range.get

		for ( value of range ) {
			value
		}

		return new ChangeDelta( transaction, {} );
	} );

	register( 'removeAttr', ( doc, transaction, key, range ) => {
		return new ChangeDelta( transaction, {} );
	} );

	return ChangeDelta;
} );