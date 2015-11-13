/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/delta',
	'document/delta/register',
	'document/operation/insertoperation'
], ( Delta, register, InsertOperation ) => {
	/**
	 * @class document.delta.InsertDelta
	 */
	class InsertDelta extends Delta {}

	register( 'insert', ( doc, transaction, position, nodes ) => {
		const delta = new InsertDelta();

		const operation = new InsertOperation( position, nodes, doc.version );
		doc.applyOperation( operation );
		delta.addOperation( operation );

		transaction.addDelta( delta );
	} );

	return InsertDelta;
} );