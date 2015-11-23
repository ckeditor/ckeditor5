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
	'document/operation/removeoperation',
	'document/operation/moveoperation',
	'ckeditorerror'
], ( Delta, register, Position, Element, RemoveOperation, MoveOperation, CKEditorError ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link document.Transaction#merge} method
	 * uses the `MergeDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class document.delta.MergeDelta
	 */
	class MergeDelta extends Delta {}

	/**
	 * Merges two siblings at the given position.
	 *
	 * Node before and after the position have to be an element. Otherwise `transaction-merge-no-element-before` or
	 * `transaction-merge-no-element-after` error will be thrown.
	 *
	 * @chainable
	 * @method merge
	 * @memberOf document.Transaction
	 * @param {document.Position} position Position of merge.
	 */
	register( 'merge', ( doc, transaction, position ) => {
		const delta = new MergeDelta();
		const nodeBefore = position.nodeBefore;
		const nodeAfter = position.nodeAfter;

		if ( !( nodeBefore instanceof Element ) ) {
			/**
			 * Node before merge position must be an element.
			 *
			 * @error transaction-merge-no-element-before
			 */
			throw new CKEditorError(
				'transaction-merge-no-element-before: Node before merge position must be an element.' );
		}

		if ( !( nodeAfter instanceof Element ) ) {
			/**
			 * Node after merge position must be an element.
			 *
			 * @error transaction-merge-no-element-after
			 */
			throw new CKEditorError(
				'transaction-merge-no-element-after: Node after merge position must be an element.' );
		}

		const positionAfter = Position.createFromParentAndOffset( nodeAfter, 0 );
		const positionBefore = Position.createFromParentAndOffset( nodeBefore, nodeBefore.getChildCount() );

		const move = new MoveOperation( positionAfter, positionBefore, nodeAfter.getChildCount(), doc.version );
		doc.applyOperation( move );
		delta.addOperation( move );

		const remove = new RemoveOperation( position, 1, doc.version );
		doc.applyOperation( remove );
		delta.addOperation( remove );

		transaction.addDelta( delta );
	} );

	return MergeDelta;
} );