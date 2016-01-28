/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import { register } from '../batch-base.js';
import InsertOperation from '../operation/insertoperation.js';
import NodeList from '../nodelist.js';

/**
 * To provide specific OT behavior and better collisions solving, the {@link treeModel.Batch#insert} method
 * uses the `WeakInsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @class treeModel.delta.WeakInsertDelta
 */
export default class WeakInsertDelta extends Delta {}

/**
 * Inserts a node or nodes at the given position. {@link treeModel.Batch#weakInsert} is commonly used for actions
 * like typing or plain-text paste (without formatting). There are two differences between
 * {@link treeModel.Batch#insert} and {@link treeModel.Batch#weakInsert}:
 * * When using `weakInsert`, inserted nodes will have same attributes as the current attributes of
 * {@link treeModel.Document#selection document selection}.
 * * The above has to be reflected during {@link treeModel.operation.transform operational transformation}. Normal
 * behavior is that inserting inside range changed by {@link treeModel.operation.AttributeOperation} splits the operation
 * into two operations, which "omit" the inserted nodes. The correct behavior for `WeakInsertDelta` is that
 * {@link treeModel.operation.AttributeOperation} does not "break" and also applies attributes for inserted nodes.
 *
 * @chainable
 * @memberOf treeModel.Batch
 * @method weakInsert
 * @param {treeModel.Position} position Position of insertion.
 * @param {treeModel.NodesSet} nodes The list of nodes to be inserted.
 */
register( 'weakInsert', function( position, nodes ) {
	const delta = new WeakInsertDelta();

	nodes = new NodeList( nodes );

	for ( let node of nodes._nodes ) {
		node._attrs = new Map( this.doc.selection.getAttributes() );
	}

	const operation = new InsertOperation( position, nodes, this.doc.version );
	this.doc.applyOperation( operation );
	delta.addOperation( operation );

	this.addDelta( delta );

	return this;
} );
