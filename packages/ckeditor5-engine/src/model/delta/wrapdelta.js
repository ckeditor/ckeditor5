/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import UnwrapDelta from './unwrapdelta.js';
import { register } from '../batch.js';
import Position from '../position.js';
import Range from '../range.js';
import Element from '../element.js';
import InsertOperation from '../operation/insertoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, {@link engine.model.Batch#merge} method
 * uses the `WrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class WrapDelta extends Delta {
	/**
	 * Range to wrap or `null` if there are no operations in the delta.
	 *
	 * @type {engine.model.Range|null}
	 */
	get range() {
		let moveOp = this._moveOperation;

		return moveOp ? Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany ) : null;
	}

	/**
	 * Offset size of range to wrap by the delta or `null` if there are no operations in delta.
	 *
	 * @type {Number}
	 */
	get howMany() {
		let range = this.range;

		return range ? range.end.offset - range.start.offset : 0;
	}

	/**
	 * Operation that inserts wrapping element or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.model.operation.InsertOperation|engine.model.operation.ReinsertOperation}
	 */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation that moves wrapped nodes to their new parent or `null` if there are no operations in the delta.
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
		return UnwrapDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.WrapDelta';
	}

	/**
	 * @inheritDoc
	 */
	static get _priority() {
		return 10;
	}
}

/**
 * Wraps given range with given element or with a new element with specified name, if string has been passed.
 * **Note:** range to wrap should be a "flat range" (see {@link engine.model.Range#isFlat}). If not, error will be thrown.
 *
 * @chainable
 * @method engine.model.Batch#wrap
 * @param {engine.model.Range} range Range to wrap.
 * @param {engine.model.Element|String} elementOrString Element or name of element to wrap the range with.
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

	let element = elementOrString instanceof Element ? elementOrString : new Element( elementOrString );

	if ( element.getChildCount() > 0 ) {
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

	let insert = new InsertOperation( range.end, element, this.document.version );
	delta.addOperation( insert );
	this.document.applyOperation( insert );

	let targetPosition = Position.createFromParentAndOffset( element, 0 );
	let move = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, this.document.version );
	delta.addOperation( move );
	this.document.applyOperation( move );

	return this;
} );

DeltaFactory.register( WrapDelta );
