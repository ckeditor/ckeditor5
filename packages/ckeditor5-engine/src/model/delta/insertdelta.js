/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/insertdelta
 */

import Delta from './delta';
import RemoveDelta from './removedelta';
import DeltaFactory from './deltafactory';
import InsertOperation from '../operation/insertoperation';
import { register } from '../batch';
import { normalizeNodes } from './../writer';

import DocumentFragment from '../documentfragment';
import Range from '../../model/range.js';
import Position from '../../model/position.js';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/batch~Batch#insert Batch#insert} method
 * uses the `InsertDelta` class which inherits from the `Delta` class and may overwrite some methods.
 */
export default class InsertDelta extends Delta {
	/**
	 * @inheritDoc
	 */
	get type() {
		return 'insert';
	}

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
}

/**
 * Inserts a node or nodes at the given position.
 *
 * When inserted element is a {@link module:engine/model/documentfragment~DocumentFragment} and has markers its markers will
 * be set to {@link module:engine/model/document~Document#markers}.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#insert
 * @param {module:engine/model/position~Position} position Position of insertion.
 * @param {module:engine/model/node~NodeSet} nodes The list of nodes to be inserted.
 */
register( 'insert', function( position, nodes ) {
	const normalizedNodes = normalizeNodes( nodes );

	// If nothing is inserted do not create delta and operation.
	if ( normalizedNodes.length === 0 ) {
		return this;
	}

	const delta = new InsertDelta();
	const insert = new InsertOperation( position, normalizedNodes, this.document.version );

	this.addDelta( delta );
	delta.addOperation( insert );
	this.document.applyOperation( insert );

	// When element is a DocumentFragment we need to move its markers to Document#markers.
	if ( nodes instanceof DocumentFragment ) {
		for ( const [ markerName, markerRange ] of nodes.markers ) {
			// We need to migrate marker range from DocumentFragment to Document.
			const rangeRootPosition = Position.createAt( markerRange.root );
			const range = new Range(
				markerRange.start._getCombined( rangeRootPosition, position ),
				markerRange.end._getCombined( rangeRootPosition, position )
			);

			this.setMarker( markerName, range );
		}
	}

	return this;
} );

DeltaFactory.register( InsertDelta );
