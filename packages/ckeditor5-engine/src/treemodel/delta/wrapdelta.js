/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
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
 * To provide specific OT behavior and better collisions solving, {@link engine.treeModel.Batch#merge} method
 * uses the `WrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.treeModel.delta
 */
export default class WrapDelta extends Delta {
	/**
	 * Range to wrap or `null` if there are no operations in the delta.
	 *
	 * @type {engine.treeModel.Range|null}
	 */
	get range() {
		let moveOp = this._moveOperation;

		return moveOp ? Range.createFromPositionAndShift( moveOp.sourcePosition, moveOp.howMany ) : null;
	}

	/**
	 * How many nodes is wrapped by the delta or `null` if there are no operations in delta.
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
	 * @type {engine.treeModel.operation.InsertOperation|engine.treeModel.operation.ReinsertOperation}
	 */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * Operation that moves wrapped nodes to their new parent or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.treeModel.operation.MoveOperation|null}
	 */
	get _moveOperation() {
		return this.operations[ 1 ] || null;
	}

	/**
	 * @see engine.treeModel.delta.Delta#_reverseDeltaClass
	 * @private
	 * @type {Object}
	 */
	get _reverseDeltaClass() {
		return UnwrapDelta;
	}

	static get _priority() {
		return 10;
	}
}

/**
 * Wraps given range with given element or with a new element of specified name if string has been passed.
 * **Note:** given range should be a "flat range" (see {@link engine.treeModel.Range#isFlat}). If not, error will be thrown.
 *
 * @chainable
 * @method engine.treeModel.Batch#wrap
 * @param {engine.treeModel.Range} range Range to wrap.
 * @param {engine.treeModel.Element|String} elementOrString Element or name of element to wrap the range with.
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

	let insert = new InsertOperation( range.end, element, this.doc.version );
	delta.addOperation( insert );
	this.doc.applyOperation( insert );

	let targetPosition = Position.createFromParentAndOffset( element, 0 );
	let move = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, this.doc.version );
	delta.addOperation( move );
	this.doc.applyOperation( move );

	return this;
} );
