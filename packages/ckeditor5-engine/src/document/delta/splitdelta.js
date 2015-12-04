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
	 * To provide specific OT behavior and better collisions solving, the {@link document.Batch#split} method
	 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class document.delta.SplitDelta
	 */
	class SplitDelta extends Delta {}

	/**
	 * Splits a node at the given position.
	 *
	 * This cannot be a position inside the root element. The `batch-split-root` error will be thrown if
	 * you try to split the root element.
	 *
	 * @chainable
	 * @method split
	 * @memberOf document.Batch
	 * @param {document.Position} position Position of split.
	 */
	register( 'split', function( position ) {
		const delta = new SplitDelta();
		const splitElement = position.parent;

		if ( !splitElement.parent ) {
			/**
			 * Root element can not be split.
			 *
			 * @error batch-split-root
			 */
			throw new CKEditorError( 'batch-split-root: Root element can not be split.' );
		}

		const copy = new Element( splitElement.name, splitElement.getAttrs() );
		const insert = new InsertOperation( Position.createAfter( splitElement ), copy, this.doc.version );

		this.doc.applyOperation( insert );
		delta.addOperation( insert );

		const move = new MoveOperation(
			position,
			splitElement.getChildCount() - position.offset,
			Position.createFromParentAndOffset( copy, 0 ),
			this.doc.version
		);

		this.doc.applyOperation( move );
		delta.addOperation( move );

		this.addDelta( delta );

		return this;
	} );

	return SplitDelta;
} );
