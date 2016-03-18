/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import SplitDelta from './splitdelta.js';
import { register } from '../batch.js';
import Position from '../position.js';
import Element from '../element.js';
import RemoveOperation from '../operation/removeoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link core.treeModel.Batch#merge} method
 * uses the `MergeDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf core.treeModel.delta
 */
export default class MergeDelta extends Delta {
	/**
	 * Position between to merged nodes or `null` if the delta has no operations.
	 *
	 * @type {core.treeModel.Position|null}
	 */
	get position() {
		return this._removeOperation ? this._removeOperation.sourcePosition : null;
	}

	/**
	 * Operation in this delta that removes the node after merge position (which will be empty at that point) or
	 * `null` if the delta has no operations. Note, that after {@link core.treeModel.delta.transform transformation}
	 * this might be an instance of {@link core.treeModel.operation.MoveOperation} instead of
	 * {@link core.treeModel.operation.RemoveOperation}.
	 *
	 * @protected
	 * @type {core.treeModel.operation.MoveOperation|null}
	 */
	get _removeOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @see core.treeModel.delta.Delta#_reverseDeltaClass
	 * @protected
	 * @type {Object}
	 */
	get _reverseDeltaClass() {
		return SplitDelta;
	}
}

/**
 * Merges two siblings at the given position.
 *
 * Node before and after the position have to be an element. Otherwise `batch-merge-no-element-before` or
 * `batch-merge-no-element-after` error will be thrown.
 *
 * @chainable
 * @method core.treeModel.Batch#merge
 * @param {core.treeModel.Position} position Position of merge.
 */
register( 'merge', function( position ) {
	const delta = new MergeDelta();
	const nodeBefore = position.nodeBefore;
	const nodeAfter = position.nodeAfter;

	if ( !( nodeBefore instanceof Element ) ) {
		/**
		 * Node before merge position must be an element.
		 *
		 * @error batch-merge-no-element-before
		 */
		throw new CKEditorError(
			'batch-merge-no-element-before: Node before merge position must be an element.' );
	}

	if ( !( nodeAfter instanceof Element ) ) {
		/**
		 * Node after merge position must be an element.
		 *
		 * @error batch-merge-no-element-after
		 */
		throw new CKEditorError(
			'batch-merge-no-element-after: Node after merge position must be an element.' );
	}

	const positionAfter = Position.createFromParentAndOffset( nodeAfter, 0 );
	const positionBefore = Position.createFromParentAndOffset( nodeBefore, nodeBefore.getChildCount() );

	const move = new MoveOperation( positionAfter, nodeAfter.getChildCount(), positionBefore, this.doc.version );
	delta.addOperation( move );
	this.doc.applyOperation( move );

	const remove = new RemoveOperation( position, 1, this.doc.version );
	delta.addOperation( remove );
	this.doc.applyOperation( remove );

	this.addDelta( delta );

	return this;
} );
