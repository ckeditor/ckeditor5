/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/insertdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import RemoveDelta from './removedelta';
import { register } from '../batch';
import InsertOperation from '../operation/insertoperation';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/batch~Batch#insert Batch#insert} method
 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class InsertDelta extends Delta {
	/**
	 * Position where the delta inserts nodes or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get position() {
		return this._insertOperation ? this._insertOperation.position : null;
	}

	/**
	 * Node list containing all the nodes inserted by the delta or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @type {module:engine/model/nodelist~NodeList|null}
	 */
	get nodes() {
		return this._insertOperation ? this._insertOperation.nodes : null;
	}

	/**
	 * Insert operation that is saved in this delta or `null` if there are no operations in the delta.
	 *
	 * @readonly
	 * @protected
	 * @type {module:engine/model/operation/insertoperation~InsertOperation|null}
	 */
	get _insertOperation() {
		return this.operations[ 0 ] || null;
	}

	/**
	 * @inheritDoc
	 */
	get _reverseDeltaClass() {
		return RemoveDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.InsertDelta';
	}

	/**
	 * @inheritDoc
	 */
	static get _priority() {
		return 20;
	}
}

/**
 * Inserts a node or nodes at the given position.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#insert
 * @param {module:engine/model/position~Position} position Position of insertion.
 * @param {module:engine/model/node~NodeSet} nodes The list of nodes to be inserted.
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
