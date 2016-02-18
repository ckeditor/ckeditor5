/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import { register } from '../batch-base.js';
import InsertOperation from '../operation/insertoperation.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link core.treeModel.Batch#insert Batch#insert} method
 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @class core.treeModel.delta.InsertDelta
 */
export default class InsertDelta extends Delta {}

/**
 * Inserts a node or nodes at the given position.
 *
 * @chainable
 * @method core.treeModel.Batch#insert
 * @param {core.treeModel.Position} position Position of insertion.
 * @param {core.treeModel.NodeSet} nodes The list of nodes to be inserted.
 * List of nodes can be of any type accepted by the {@link core.treeModel.NodeList} constructor.
 */
register( 'insert', function( position, nodes ) {
	const delta = new InsertDelta();

	const operation = new InsertOperation( position, nodes, this.doc.version );
	this.doc.applyOperation( operation );
	delta.addOperation( operation );

	this.addDelta( delta );

	return this;
} );
