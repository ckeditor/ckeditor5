/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import { default as Delta, registerDeserializer } from './delta.js';
import WrapDelta from './wrapdelta.js';
import { register } from '../batch.js';
import Position from '../position.js';
import RemoveOperation from '../operation/removeoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link engine.treeModel.Batch#merge} method
 * uses the `UnwrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.treeModel.delta
 */
export default class UnwrapDelta extends Delta {
	/**
	 * Position before unwrapped element or `null` if there are no operations in the delta.
	 *
	 * @type {engine.treeModel.Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.targetPosition : null;
	}

	/**
	 * Operation in the delta that moves unwrapped nodes to their new parent or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.treeModel.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 0 ] || null;
	}

	get _reverseDeltaClass() {
		return WrapDelta;
	}

	/** @inheritDoc */
	static get className() {
		return 'engine.treeModel.delta.UnwrapDelta';
	}

	static get _priority() {
		return 10;
	}
}

/**
 * Unwraps specified element, that is moves all it's children before it and then removes it. Throws
 * error if you try to unwrap an element that does not have a parent.
 *
 * @chainable
 * @method engine.treeModel.Batch#unwrap
 * @param {engine.treeModel.Element} position Element to unwrap.
 */
register( 'unwrap', function( element ) {
	if ( element.parent === null ) {
		/**
		 * Trying to unwrap an element that has no parent.
		 *
		 * @error batch-unwrap-element-no-parent
		 */
		throw new CKEditorError( 'batch-unwrap-element-no-parent: Trying to unwrap an element that has no parent.' );
	}

	const delta = new UnwrapDelta();
	this.addDelta( delta );

	let sourcePosition = Position.createFromParentAndOffset( element, 0 );

	const move = new MoveOperation( sourcePosition, element.getChildCount(), Position.createBefore( element ), this.doc.version );
	move.isSticky = true;
	delta.addOperation( move );
	this.doc.applyOperation( move );

	// Computing new position because we moved some nodes before `element`.
	// If we would cache `Position.createBefore( element )` we remove wrong node.
	const remove = new RemoveOperation( Position.createBefore( element ), 1, this.doc.version );
	delta.addOperation( remove );
	this.doc.applyOperation( remove );

	return this;
} );

registerDeserializer( UnwrapDelta.className, UnwrapDelta );
