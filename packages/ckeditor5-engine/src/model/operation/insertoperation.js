/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Operation from './operation.js';
import NodeList from '../nodelist.js';
import Position from '../position.js';
import Range from '../range.js';
import RemoveOperation from './removeoperation.js';

/**
 * Operation to insert list of nodes on the given position in the tree data model.
 *
 * @memberOf engine.model.operation
 * @extends engine.model.operation.Operation
 */
export default class InsertOperation extends Operation {
	/**
	 * Creates an insert operation.
	 *
	 * @param {engine.model.Position} position Position of insertion.
	 * @param {engine.model.NodeSet} nodes The list of nodes to be inserted.
	 * List of nodes can be any type accepted by the {@link engine.model.NodeList} constructor.
	 * @param {Number} baseVersion {@link engine.model.Document#version} on which operation can be applied.
	 */
	constructor( position, nodes, baseVersion ) {
		super( baseVersion );

		/**
		 * Position of insertion.
		 *
		 * @readonly
		 * @member {engine.model.Position} engine.model.operation.InsertOperation#position
		 */
		this.position = Position.createFromPosition( position );

		/**
		 * List of nodes to insert.
		 *
		 * @readonly
		 * @member {engine.model.NodeList} engine.model.operation.InsertOperation#nodeList
		 */
		this.nodeList = new NodeList( nodes );
	}

	get type() {
		return 'insert';
	}

	/**
	 * @returns {engine.model.operation.InsertOperation}
	 */
	clone() {
		return new InsertOperation( this.position, this.nodeList, this.baseVersion );
	}

	/**
	 * @returns {engine.model.operation.RemoveOperation}
	 */
	getReversed() {
		return new RemoveOperation( this.position, this.nodeList.length, this.baseVersion + 1 );
	}

	_execute() {
		this.position.parent.insertChildren( this.position.offset, this.nodeList );

		return {
			range: Range.createFromPositionAndShift( this.position, this.nodeList.length )
		};
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.InsertOperation';
	}

	/**
	 * Creates InsertOperation object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {engine.model.Document} document Document on which this operation will be applied.
	 * @returns {engine.model.operation.InsertOperation}
	 */
	static fromJSON( json, document ) {
		return new InsertOperation( Position.fromJSON( json.position, document ), NodeList.fromJSON( json.nodeList ), json.baseVersion );
	}
}
