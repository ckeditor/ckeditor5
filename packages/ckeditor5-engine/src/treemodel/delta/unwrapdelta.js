/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/delta/delta',
	'treemodel/delta/register',
	'treemodel/position',
	'treemodel/element',
	'treemodel/operation/removeoperation',
	'treemodel/operation/moveoperation',
	'ckeditorerror'
], ( Delta, register, Position, Element, RemoveOperation, MoveOperation, CKEditorError ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#merge} method
	 * uses the `UnwrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.UnwrapDelta
	 */
	class UnwrapDelta extends Delta {}

	/**
	 * Unwraps specified element, that is moves all it's children before it and then removes it. Throws
	 * error if you try to unwrap an element that does not have a parent.
	 *
	 * @chainable
	 * @method unwrap
	 * @memberOf treeModel.Batch
	 * @param {treeModel.Element} position Element to unwrap.
	 */
	register( 'unwrap', function( element ) {
		if ( element.parent === null ) {
			/**
			 * Trying to unwrap an element that has no parent.
			 *
			 * @error batch-unwrap-element-no-parent
			 */
			throw new CKEditorError(
				'batch-unwrap-element-no-parent: Trying to unwrap an element that has no parent.' );
		}

		const delta = new UnwrapDelta();

		let sourcePosition = Position.createFromParentAndOffset( element, 0 );

		const move = new MoveOperation( sourcePosition, element.getChildCount(), Position.createBefore( element ), this.doc.version );
		this.doc.applyOperation( move );
		delta.addOperation( move );

		// Computing new position because we moved some nodes before `element`.
		// If we would cache `Position.createBefore( element )` we remove wrong node.
		const remove = new RemoveOperation( Position.createBefore( element ), 1, this.doc.version );
		this.doc.applyOperation( remove );
		delta.addOperation( remove );

		this.addDelta( delta );

		return this;
	} );

	return UnwrapDelta;
} );
