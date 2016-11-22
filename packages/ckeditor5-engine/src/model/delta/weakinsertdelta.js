/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/weakinsertdelta
 */

import InsertDelta from './insertdelta.js';
import { register } from '../batch.js';
import DeltaFactory from './deltafactory.js';
import InsertOperation from '../operation/insertoperation.js';
import { normalizeNodes } from './../writer.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/batch~Batch#insert} method
 * uses the `WeakInsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class WeakInsertDelta extends InsertDelta {
	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.WeakInsertDelta';
	}
}

/**
 * Inserts a node or nodes at given position. {@link module:engine/model/batch~Batch#weakInsert weakInsert} is commonly used for actions
 * like typing or plain-text paste (without formatting). There are two differences between
 * {@link module:engine/model/batch~Batch#insert insert} and {@link module:engine/model/batch~Batch#weakInsert weakInsert}:
 *
 * * When using `weakInsert`, inserted nodes will have same attributes as the current attributes of
 * {@link module:engine/model/document~Document#selection document selection}.
 * * If {@link module:engine/model/operation/insertoperation~insertOperation insert operation} position is inside a range changed by
 * {@link module:engine/model/operation/attributeoperation~AttributeOperation attribute operation},
 * the attribute operation is split into two operations.
 * Thanks to this, attribute change "omits" the inserted nodes. The correct behavior for `WeakInsertDelta` is that
 * {@link module:engine/model/operation/attributeoperation~AttributeOperation AttributeOperation} does not "break" and also
 * applies attributes for inserted nodes. This behavior has to be reflected during
 * {@link module:engine/model/delta/transform~transform delta transformation}.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#weakInsert
 * @param {module:engine/model/position~Position} position Position of insertion.
 * @param {module:engine/model/node~NodeSet} nodes The list of nodes to be inserted.
 */
register( 'weakInsert', function( position, nodes ) {
	const delta = new WeakInsertDelta();
	this.addDelta( delta );

	nodes = normalizeNodes( nodes );

	for ( let node of nodes ) {
		node.setAttributesTo( this.document.selection.getAttributes() );
	}

	const operation = new InsertOperation( position, nodes, this.document.version );
	delta.addOperation( operation );
	this.document.applyOperation( operation );

	return this;
} );

DeltaFactory.register( WeakInsertDelta );
