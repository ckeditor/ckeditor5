/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import { register } from '../batch.js';
import Position from '../position.js';
import Element from '../element.js';
import InsertOperation from '../operation/insertoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';
import MergeDelta from '../delta/mergedelta.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link engine.model.Batch#split} method
 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class SplitDelta extends Delta {
	/**
	 * Position of split or `null` if there are no operations in the delta.
	 *
	 * @type {engine.model.Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * @inheritDoc
	 */
	getReversed() {
		let delta = super.getReversed();

		if ( delta.operations.length > 0 ) {
			delta.operations[ 0 ].isSticky = true;
		}

		return delta;
	}

	/**
	 * Operation in the delta that adds to model an element into which split nodes will be moved, or `null` if
	 * there are no operations in the delta.
	 *
	 * Most commonly this will be {@link engine.model.operation.InsertOperation an insert operation}, as `SplitDelta`
	 * has to create a new node. If `SplitDelta` was created through {@link engine.model.delta.Delta#getReversed reversing}
	 * a {@link engine.model.delta.MergeDelta merge delta}, this will be a {@link engine.model.operation.ReinsertOperation reinsert operation},
	 * as we will want to re-insert the exact element that was removed by that merge delta.
	 *
	 * @protected
	 * @type {engine.model.operation.InsertOpertaion|engine.model.operation.ReinsertOperation|null}
	 */
	get _cloneOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation in the delta that moves model items, that are after split position, to their new parent or `null`
	 * if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.model.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return MergeDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.SplitDelta';
	}

	/**
	 * @inheritDoc
	 */
	static get _priority() {
		return 5;
	}
}

/**
 * Splits an element at the given position.
 *
 * The element cannot be a root element, as root element cannot be split. The `batch-split-root` error will be thrown if
 * you try to split the root element.
 *
 * @chainable
 * @method engine.model.Batch#split
 * @param {engine.model.Position} position Position of split.
 */
register( 'split', function( position ) {
	const delta = new SplitDelta();
	this.addDelta( delta );

	const splitElement = position.parent;

	if ( !splitElement.parent ) {
		/**
		 * Root element can not be split.
		 *
		 * @error batch-split-root
		 */
		throw new CKEditorError( 'batch-split-root: Root element can not be split.' );
	}

	const copy = new Element( splitElement.name, splitElement.getAttributes() );

	const insert = new InsertOperation( Position.createAfter( splitElement ), copy, this.document.version );

	delta.addOperation( insert );
	this.document.applyOperation( insert );

	const move = new MoveOperation(
		position,
		splitElement.maxOffset - position.offset,
		Position.createFromParentAndOffset( copy, 0 ),
		this.document.version
	);
	move.isSticky = true;

	delta.addOperation( move );
	this.document.applyOperation( move );

	return this;
} );

DeltaFactory.register( SplitDelta );
