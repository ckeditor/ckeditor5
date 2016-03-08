/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import InsertDelta from './insertdelta.js';
import { register } from '../batch.js';
import InsertOperation from '../operation/insertoperation.js';
import NodeList from '../nodelist.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link core.treeModel.Batch#insert} method
 * uses the `WeakInsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf core.treeModel.delta
 */
export default class WeakInsertDelta extends InsertDelta {}

/**
 * Inserts a node or nodes at the given position. {@link core.treeModel.Batch#weakInsert weakInsert} is commonly used for actions
 * like typing or plain-text paste (without formatting). There are two differences between
 * {@link core.treeModel.Batch#insert insert} and {@link core.treeModel.Batch#weakInsert weakInsert}:
 * * When using `weakInsert`, inserted nodes will have same attributes as the current attributes of
 * {@link core.treeModel.Document#selection document selection}.
 * * Normal behavior is that inserting inside range changed by {@link core.treeModel.operation.AttributeOperation AttributeOperation} splits
 * the operation into two operations, which "omit" the inserted nodes. The correct behavior for `WeakInsertDelta` is that
 * {@link core.treeModel.operation.AttributeOperation AttributeOperation} does not "break" and also applies attributes for inserted nodes.
 * The above has to be reflected during {@link core.treeModel.operation.transform operational transformation}.
 *
 * @chainable
 * @method core.treeModel.Batch#weakInsert
 * @param {core.treeModel.Position} position Position of insertion.
 * @param {core.treeModel.NodeSet} nodes The list of nodes to be inserted.
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
