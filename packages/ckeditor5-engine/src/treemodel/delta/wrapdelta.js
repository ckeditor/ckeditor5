/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import { register } from '../batch-base.js';
import Position from '../position.js';
import Element from '../element.js';
import InsertOperation from '../operation/insertoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import CKEditorError from '../../ckeditorerror.js';

/**
 * To provide specific OT behavior and better collisions solving, {@link treeModel.Batch#merge} method
 * uses the `WrapDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @class treeModel.delta.WrapDelta
 */
export default class WrapDelta extends Delta {}

/**
 * Wraps given range with given element or with a new element of specified name if string has been passed.
 * **Note:** given range should be a "flat range" (see {@link treeModel.Range#isFlat}). If not, error will be thrown.
 *
 * @chainable
 * @method wrap
 * @memberOf treeModel.Batch
 * @param {treeModel.Range} range Range to wrap.
 * @param {treeModel.Element|String} elementOrString Element or name of element to wrap the range with.
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

	let insert = new InsertOperation( range.end, element, this.doc.version );
	this.doc.applyOperation( insert );
	delta.addOperation( insert );

	let targetPosition = Position.createFromParentAndOffset( element, 0 );
	let move = new MoveOperation( range.start, range.end.offset - range.start.offset, targetPosition, this.doc.version );
	this.doc.applyOperation( move );
	delta.addOperation( move );

	this.addDelta( delta );

	return this;
} );
