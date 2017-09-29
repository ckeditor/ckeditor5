/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/unwrapdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import WrapDelta from './wrapdelta';
import { register } from '../batch';
import Position from '../position';
import RemoveOperation from '../operation/removeoperation';
import MoveOperation from '../operation/moveoperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/batch~Batch#merge} method
 * uses the `UnwrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @extends module:engine/model/delta/delta~Delta
 */
export default class UnwrapDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'unwrap';
	}

	/**
	 * Position before unwrapped element or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * Operation in the delta that moves unwrapped nodes to their new parent or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return WrapDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.UnwrapDelta';
	}
}

/**
 * Unwraps children of the given element – all its children are moved before it and then the element is removed.
 * Throws error if you try to unwrap an element which does not have a parent.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#unwrap
 * @param {module:engine/model/element~Element} position Element to unwrap.
 */
register( 'unwrap', function( element ) {
	if ( element.parent === null ) {
		/**
		 * Trying to unwrap an element which has no parent.
		 *
		 * @error batch-unwrap-element-no-parent
		 */
		throw new CKEditorError( 'batch-unwrap-element-no-parent: Trying to unwrap an element which has no parent.' );
	}

	const delta = new UnwrapDelta();
	this.addDelta( delta );

	const sourcePosition = Position.createFromParentAndOffset( element, 0 );

	const move = new MoveOperation(
		sourcePosition,
		element.maxOffset,
		Position.createBefore( element ),
		this.document.version
	);

	move.isSticky = true;
	delta.addOperation( move );
	this.document.applyOperation( move );

	// Computing new position because we moved some nodes before `element`.
	// If we would cache `Position.createBefore( element )` we remove wrong node.
	const graveyard = this.document.graveyard;
	const gyPosition = new Position( graveyard, [ 0 ] );

	const remove = new RemoveOperation( Position.createBefore( element ), 1, gyPosition, this.document.version );
	delta.addOperation( remove );
	this.document.applyOperation( remove );

	return this;
} );

DeltaFactory.register( UnwrapDelta );
