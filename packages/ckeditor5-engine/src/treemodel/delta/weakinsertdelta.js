/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import InsertDelta from './insertdelta.js';
import { register } from '../batch.js';
import { registerDeserializer } from './delta.js';
import InsertOperation from '../operation/insertoperation.js';
import NodeList from '../nodelist.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link engine.treeModel.Batch#insert} method
 * uses the `WeakInsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.treeModel.delta
 */
export default class WeakInsertDelta extends InsertDelta {
	static get className() {
		return 'engine.treeModel.delta.WeakInsertDelta';
	}
}

/**
 * Inserts a node or nodes at the given position. {@link engine.treeModel.Batch#weakInsert weakInsert} is commonly used for actions
 * like typing or plain-text paste (without formatting). There are two differences between
 * {@link engine.treeModel.Batch#insert insert} and {@link engine.treeModel.Batch#weakInsert weakInsert}:
 *
 * * When using `weakInsert`, inserted nodes will have same attributes as the current attributes of
 * {@link engine.treeModel.Document#selection document selection}.
 * * Normal behavior is that inserting inside range changed by
 * {@link engine.treeModel.operation.AttributeOperation AttributeOperation} splits
 * the operation into two operations, which "omit" the inserted nodes. The correct behavior for `WeakInsertDelta` is that
 * {@link engine.treeModel.operation.AttributeOperation AttributeOperation} does not "break" and also
 * applies attributes for inserted nodes.
 * The above has to be reflected during {@link engine.treeModel.operation.transform operational transformation}.
 *
 * @chainable
 * @method engine.treeModel.Batch#weakInsert
 * @param {engine.treeModel.Position} position Position of insertion.
 * @param {engine.treeModel.NodeSet} nodes The list of nodes to be inserted.
 */
register( 'weakInsert', function( position, nodes ) {
	const delta = new WeakInsertDelta();
	this.addDelta( delta );

	nodes = new NodeList( nodes );

	for ( let node of nodes._nodes ) {
		node._attrs = new Map( this.doc.selection.getAttributes() );
	}

	const operation = new InsertOperation( position, nodes, this.doc.version );
	delta.addOperation( operation );
	this.doc.applyOperation( operation );

	return this;
} );

registerDeserializer( WeakInsertDelta.className, WeakInsertDelta );
