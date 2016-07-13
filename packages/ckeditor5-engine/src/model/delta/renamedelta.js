/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import { register } from '../batch.js';
import InsertOperation from '../operation/insertoperation.js';
import RemoveOperation from '../operation/removeoperation.js';
import MoveOperation from '../operation/moveoperation.js';
import Element from '../element.js';
import Position from '../position.js';

/**
 * To provide specific OT behavior and better collisions solving, the {@link engine.model.Batch#rename Batch#rename} method
 * uses the `RenameDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class RenameDelta extends Delta {
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
	batch.addDelta( delta );
	delta.addOperation( operation );
	batch.document.applyOperation( operation );
}

/**
 * Renames the given element.
 *
 * @chainable
 * @method engine.model.Batch#rename
 * @param {String} newName New element name.
 * @param {engine.model.Element} element The element to rename.
 */
register( 'rename', function( newName, element ) {
	const delta = new RenameDelta();
	const newElement = new Element( newName );

	apply(
		this, delta,
		new InsertOperation( Position.createAfter( element ), newElement, this.document.version )
	);

	apply(
		this, delta,
		new MoveOperation( Position.createAt( element ), element.getChildCount(), Position.createAt( newElement ), this.document.version )
	);

	apply(
		this, delta,
		new RemoveOperation( Position.createBefore( element ), 1, this.document.version )
	);

	return this;
} );

DeltaFactory.register( RenameDelta );
