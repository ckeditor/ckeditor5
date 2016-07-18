/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Delta from './delta.js';
import DeltaFactory from './deltafactory.js';
import RemoveDelta from './removedelta.js';
import { register } from '../batch.js';
import InsertOperation from '../operation/insertoperation.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link engine.model.Batch#insert Batch#insert} method
 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 *
 * @memberOf engine.model.delta
 */
export default class InsertDelta extends Delta {
	/**
	 * Position where the delta inserts nodes or `null` if there are no operations in the delta.
	 *
	 * @type {engine.model.Position|null}
	 */
	get position() {
		return this._insertOperation ? this._insertOperation.position : null;
	}

	/**
	 * Node list containing all the nodes inserted by the delta or `null` if there are no operations in the delta.
	 *
	 * @type {engine.model.NodeList|null}
	 */
	get nodes() {
		return this._insertOperation ? this._insertOperation.nodes : null;
	}

	/**
	 * Insert operation that is saved in this delta or `null` if there are no operations in the delta.
	 *
	 * @protected
	 * @type {engine.model.operation.InsertOperation|null}
	 */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	get _reverseDeltaClass() {
		return RemoveDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.InsertDelta';
	}

	static get _priority() {
		return 20;
	}
}

/**
 * Inserts a node or nodes at the given position.
 *
 * @chainable
 * @method engine.model.Batch#insert
 * @param {engine.model.Position} position Position of insertion.
 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
 */
register( 'insert', function( position, nodes ) {
	const delta = new InsertDelta();
	const insert = new InsertOperation( position, nodes, this.document.version );

	this.addDelta( delta );
	delta.addOperation( insert );
	this.document.applyOperation( insert );

	return this;
} );

DeltaFactory.register( InsertDelta );
