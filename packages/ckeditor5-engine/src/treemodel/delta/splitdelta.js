/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import { register } from '../batch.js';
import Position from '../position.js';
import Element from '../element.js';
import InsertOperation from '../operation/insertoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';
import MergeDelta from '../delta/mergedelta.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link core.treeModel.Batch#split} method
 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf core.treeModel.delta
 */
export default class SplitDelta extends Delta {
	/**
	 * Position of split or `null` if there are no operations in the delta.
	 *
	 * @type {core.treeModel.Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * Operation in the delta that adds a node to the tree model where split elements will be moved to or `null` if
	 * there are no operations in the delta.
	 *
	 * Most commonly this will be insert operation, as `SplitDelta` has to create a new node. If `SplitDelta` was created
	 * through {@link core.treeModel.delta.MergeDelta MergeDelta} {@link core.treeModel.delta.Delta#getReversed reversing},
	 * this will be a reinsert operation, as we will want to "insert-back" the node that was removed by `MergeDelta`.
	 *
	 * @protected
	 * @type {core.treeModel.operation.InsertOpertaion|core.treeModel.operation.ReinsertOperation|null}
	 */
	get _cloneOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation in the delta that moves nodes from after split position to their new parent
	 * or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {core.treeModel.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @see core.treeModel.delta.Delta#_reverseDeltaClass
	 * @private
	 * @type {Object}
	 */
	get _reverseDeltaClass() {
		return MergeDelta;
	}

	static get _priority() {
		return 10;
	}
}

/**
 * Splits a node at the given position.
 *
 * This cannot be a position inside the root element. The `batch-split-root` error will be thrown if
 * you try to split the root element.
 *
 * @chainable
 * @method core.treeModel.Batch#split
 * @param {core.treeModel.Position} position Position of split.
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

	const copy = new Element( splitElement.name, splitElement._attrs );

	const insert = new InsertOperation( Position.createAfter( splitElement ), copy, this.doc.version );

	delta.addOperation( insert );
	this.doc.applyOperation( insert );

	const move = new MoveOperation(
		position,
		splitElement.getChildCount() - position.offset,
		Position.createFromParentAndOffset( copy, 0 ),
		this.doc.version
	);

	delta.addOperation( move );
	this.doc.applyOperation( move );

	this.addDelta( delta );

	return this;
} );
