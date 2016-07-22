/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import { register } from '../batch.js';
import InsertOperation from '../operation/insertoperation.js';
import RemoveOperation from '../operation/removeoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import Element from '../element.js';
import Position from '../position.js';
import CKEditorError from '../../../utils/ckeditorerror.js';

/**
 * To provide specific OT behavior and better collisions solving, the {@link engine.model.Batch#rename Batch#rename} method
 * uses the `RenameDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class RenameDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return RenameDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.RenameDelta';
	}
}

function apply( batch, delta, operation ) {
	delta.addOperation( operation );
	batch.document.applyOperation( operation );
}

/**
 * Renames given element.
 *
 * @chainable
 * @method engine.model.Batch#rename
 * @param {String} newName New element name.
 * @param {engine.model.Element} element The element to rename.
 */
register( 'rename', function( newName, element ) {
	if ( !( element instanceof Element ) ) {
		/**
		 * Trying to rename an object which is not an instance of Element.
		 *
		 * @error batch-rename-not-element-instance
		 */
		throw new CKEditorError( 'batch-rename-not-element-instance: Trying to rename an object which is not an instance of Element.' );
	}

	const delta = new RenameDelta();
	this.addDelta( delta );

	const newElement = new Element( newName );

	apply(
		this, delta,
		new InsertOperation( Position.createAfter( element ), newElement, this.document.version )
	);

	apply(
		this, delta,
		new MoveOperation( Position.createAt( element ), element.getMaxOffset(), Position.createAt( newElement ), this.document.version )
	);

	apply(
		this, delta,
		new RemoveOperation( Position.createBefore( element ), 1, this.document.version )
	);

	return this;
} );

DeltaFactory.register( RenameDelta );
