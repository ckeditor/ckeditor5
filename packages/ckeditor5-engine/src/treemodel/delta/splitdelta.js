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
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link core.treeModel.Batch#split} method
 * uses `SplitDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf core.treeModel.delta
 */
export default class SplitDelta extends Delta {
	get cloneOperation() {
		return this.operations[ 0 ] || null;
	}

	get moveOperation() {
		return this.operations[ 1 ] || null;
	}

	get position() {
		return this.moveOperation ? this.moveOperation.sourcePosition : null;
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
