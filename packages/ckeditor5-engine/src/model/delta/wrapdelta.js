/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/wrapdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import UnwrapDelta from './unwrapdelta';
import { register } from '../batch';
import Position from '../position';
import Range from '../range';
import Element from '../element';
import InsertOperation from '../operation/insertoperation';
import MoveOperation from '../operation/moveoperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link module:engine/model/batch~Batch#merge} method
 * uses the `WrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class WrapDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'wrap';
	}

	/**
	 * Range to wrap or `null` if there are no operations in the delta.
	 *
	 * @type {module:engine/model/range~Range|null}
	 */
	get range() {
		const moveOp = this._moveOperation;

		return moveOp ? Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany ) : null;
	}

	/**
	 * Offset size of range to wrap by the delta or `null` if there are no operations in delta.
	 *
	 * @type {Number}
	 */
	get howMany() {
		const range = this.range;

		return range ? range.end.offset - range.start.offset : 0;
	}

	/* eslint-disable max-len */
	/**
	 * Operation that inserts wrapping element or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|module:engine/model/operation/reinsertoperation~ReinsertOperation}
	 */
	/* eslint-enable max-len */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation that moves wrapped nodes to their new parent or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {module:engine/model/operation/moveoperation~MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return UnwrapDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.WrapDelta';
	}
}

/**
 * Wraps given range with given element or with a new element with specified name, if string has been passed.
 * **Note:** range to wrap should be a "flat range" (see {@link module:engine/model/range~Range#isFlat}). If not, error will be thrown.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#wrap
 * @param {module:engine/model/range~Range} range Range to wrap.
 * @param {module:engine/model/element~Element|String} elementOrString Element or name of element to wrap the range with.
 */
register( 'wrap', function( range, elementOrString ) {
	if ( !range.isFlat ) {
		/**
		 * Range to wrap is not flat.
		 *
		 * @error batch-wrap-range-not-flat
		 */
		throw new CKEditorError( 'batch-wrap-range-not-flat: Range to wrap is not flat.' );
	}

	const element = elementOrString instanceof Element ? elementOrString : new Element( elementOrString );

	if ( element.childCount > 0 ) {
		/**
		 * Element to wrap with is not empty.
		 *
		 * @error batch-wrap-element-not-empty
		 */
		throw new CKEditorError( 'batch-wrap-element-not-empty: Element to wrap with is not empty.' );
	}

	if ( element.parent !== null ) {
		/**
		 * Element to wrap with is already attached to a tree model.
		 *
		 * @error batch-wrap-element-attached
		 */
		throw new CKEditorError( 'batch-wrap-element-attached: Element to wrap with is already attached to tree model.' );
	}

	const delta = new WrapDelta();
	this.addDelta( delta );

	const insert = new InsertOperation( range.end, element, this.document.version );
	delta.addOperation( insert );
	this.document.applyOperation( insert );

	const targetPosition = Position.createFromParentAndOffset( element, 0 );
	const move = new MoveOperation(
		range.start,
		range.end.offset - range.start.offset,
		targetPosition,
		this.document.version
	);
	delta.addOperation( move );
	this.document.applyOperation( move );

	return this;
} );

DeltaFactory.register( WrapDelta );
