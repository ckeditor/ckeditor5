/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/splitdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import { register } from '../batch';
import Position from '../position';
import Element from '../element';
import InsertOperation from '../operation/insertoperation';
import MoveOperation from '../operation/moveoperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import MergeDelta from '../delta/mergedelta';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/batch~Batch#split} method
 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class SplitDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'split';
	}

	/**
	 * Position of split or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._moveOperation ? this._moveOperation.sourcePosition : null;
	}

	/**
	 * Operation in the delta that adds to model an element into which split nodes will be moved, or `null` if
	 * there are no operations in the delta.
	 *
	 * Most commonly this will be {@link module:engine/model/operation/insertoperation~InsertOperation an insert operation},
	 * as `SplitDelta` has to create a new node. If `SplitDelta` was created through
	 * {@link module:engine/model/delta/delta~Delta#getReversed reversing}
	 * a {@link module:engine/model/delta/mergedelta~MergeDelta merge delta},
	 * this will be a {@link module:engine/model/operation/reinsertoperation~ReinsertOperation reinsert operation},
	 * as we will want to re-insert the exact element that was removed by that merge delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|
	 * module:engine/model/operation/reinsertoperation~ReinsertOperation|null}
	 */
	get _cloneOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation in the delta that moves model items, that are after split position, to their new parent or `null`
	 * if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] && this.operations[ 1 ] instanceof MoveOperation ? this.operations[ 1 ] : null;
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
}

/**
 * Splits an element at the given position.
 *
 * The element cannot be a root element, as root element cannot be split. The `batch-split-root` error will be thrown if
 * you try to split the root element.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#split
 * @param {module:engine/model/position~Position} position Position of split.
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

	const insert = new InsertOperation(
		Position.createAfter( splitElement ),
		copy,
		this.document.version
	);

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
