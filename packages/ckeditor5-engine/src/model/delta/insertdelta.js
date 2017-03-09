/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/insertdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import RemoveDelta from './removedelta';
import MarkerDelta from './markerdelta';
import { register } from '../batch';
import InsertOperation from '../operation/insertoperation';
import MarkerOperation from '../operation/markeroperation';

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
 * When inserted element is a {@link engine/model/documentfragment~DocumentFragment} and has markers its markers will
 * be set to {@link engine/model/document~Document#markers}.
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

	// When element is a DocumentFragment we need to move its markers to Document#markers.
	if ( nodes instanceof DocumentFragment ) {
		for ( const marker of nodes.markers ) {
			const doc = this.document;
			const range = moveRange( marker[ 1 ], position );
			const markerDelta = new MarkerDelta();
			const markerOperation = new MarkerOperation( marker[ 0 ], null, range, doc.markers, doc.version );

			this.addDelta( markerDelta );
			markerDelta.addOperation( markerOperation );
			doc.applyOperation( markerOperation );
		}
	}

	return this;
} );

DeltaFactory.register( InsertDelta );

// Moves range relative to given position.
//
// @param {module:engine/model/range~Range} range
// @param {module:engine/model/position~Position} position
// @returns {module:engine/model/range~Range} Moved range.
function moveRange( range, position ) {
	const positionRoot = position.parent.root;

	// Clone paths.
	let startPath = range.start.path.concat( [] );
	let endPath = range.end.path.concat( [] );

	// Move range out of DocumentFragment.
	startPath.shift();
	endPath.shift();

	// Set Range on position.
	startPath = position.path.concat( startPath );
	endPath = position.path.concat( endPath );

	return new Range( new Position( positionRoot, startPath ), new Position( positionRoot, endPath ) );
}
