/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/delta',
	'document/delta/register',
	'document/position',
	'document/element',
	'document/operation/insertoperation',
	'document/operation/moveoperation',
	'ckeditorerror'
], ( Delta, register, Position, Element, InsertOperation, MoveOperation, CKEditorError ) => {
	/**
	 * @class document.delta.SplitDelta
	 */
	class SplitDelta extends Delta {}

	register( 'split', ( doc, transaction, position ) => {
		const delta = new SplitDelta();
		const splitElement = position.parent;

		if ( !splitElement.parent ) {
			/**
			 * Root element can not be splitted.
			 *
			 * @error transaction-split-root
			 */
			throw new CKEditorError( 'transaction-split-root: Root element can not be splitted.' );
		}

		const copy = new Element( splitElement.name, splitElement.getAttrIterator() );

		const insert = new InsertOperation( Position.createAfter( splitElement ), copy, doc.version );
		doc.applyOperation( insert );
		delta.addOperation( insert );

		const move = new MoveOperation(
			position,
			Position.createFromParentAndOffset( copy, 0 ),
			splitElement.getChildCount() - position.offset,
			doc.version );
		doc.applyOperation( move );
		delta.addOperation( move );

		transaction.addDelta( delta );
	} );

	return SplitDelta;
} );