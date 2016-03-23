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
 * @memberOf engine.treeModel.operation
 * @extends engine.treeModel.operation.Operation
 */
export default class InsertOperation extends Operation {
	/**
	 * Creates an insert operation.
	 *
	 * @param {engine.treeModel.Position} position Position of insertion.
	 * @param {engine.treeModel.NodeSet} nodes The list of nodes to be inserted.
	 * List of nodes can be any type accepted by the {@link engine.treeModel.NodeList} constructor.
	 * @param {Number} baseVersion {@link engine.treeModel.Document#version} on which operation can be applied.
	 */
	constructor( position, nodes, baseVersion ) {
		super( baseVersion );

		/**
		 * Position of insertion.
		 *
		 * @readonly
		 * @member {engine.treeModel.Position} engine.treeModel.operation.InsertOperation#position
		 */
		this.position = Position.createFromPosition( position );

		/**
		 * List of nodes to insert.
		 *
		 * @readonly
		 * @member {engine.treeModel.NodeList} engine.treeModel.operation.InsertOperation#nodeList
		 */
		this.nodeList = new NodeList( nodes );
	}

	get type() {
		return 'insert';
	}

	/**
	 * @returns {engine.treeModel.operation.InsertOperation}
	 */
	clone() {
		return new InsertOperation( this.position, this.nodeList, this.baseVersion );
	}

	/**
	 * @returns {engine.treeModel.operation.RemoveOperation}
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
}
