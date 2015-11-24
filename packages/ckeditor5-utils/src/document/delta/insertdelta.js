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
	 * To provide specific OT behavior and better collisions solving, the {@link document.Transaction#insert} method
	 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class document.delta.InsertDelta
	 */
	class InsertDelta extends Delta {}

	/**
	 * Inserts a node or nodes at the given position.
	 *
	 * @chainable
	 * @memberOf document.Transaction
	 * @method insert
	 * @param {document.Position} position Position of insertion.
	 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes The list of nodes to be inserted.
	 * List of nodes can be of any type accepted by the {@link document.NodeList} constructor.
	 */
	register( 'insert', function( position, nodes ) {
		const delta = new InsertDelta();

		const operation = new InsertOperation( position, nodes, this.doc.version );
		this.doc.applyOperation( operation );
		delta.addOperation( operation );

		this.addDelta( delta );

		return this;
	} );

	return InsertDelta;
} );