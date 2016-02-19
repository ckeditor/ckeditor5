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
 * Creates an insert operation.
 *
 * @param {core.treeModel.Position} position Position of insertion.
 * @param {core.treeModel.NodeSet} nodes The list of nodes to be inserted.
 * List of nodes can be any type accepted by the {@link core.treeModel.NodeList} constructor.
 * @param {Number} baseVersion {@link core.treeModel.Document#version} on which operation can be applied.
 *
 * @class core.treeModel.operation.InsertOperation
 * @classdesc
 * Operation to insert list of nodes on the given position in the tree data model.
 * @extends core.treeModel.operation.Operation
 */
export default class InsertOperation extends Operation {
	constructor( position, nodes, baseVersion ) {
		super( baseVersion );

		/**
		 * Position of insertion.
		 *
		 * @member core.treeModel.operation.InsertOperation#position
		 * @readonly
		 * @type {core.treeModel.Position}
		 */
		this.position = Position.createFromPosition( position );

		/**
		 * List of nodes to insert.
		 *
		 * @member core.treeModel.operation.InsertOperation#nodeList
		 * @readonly
		 * @type {core.treeModel.NodeList}
		 */
		this.nodeList = new NodeList( nodes );
	}

	get type() {
		return 'insert';
	}

	/**
	 * @method core.treeModel.operation.InsertOperation#clone
	 * @returns {core.treeModel.operation.InsertOperation}
	 */
	clone() {
		return new InsertOperation( this.position, this.nodeList, this.baseVersion );
	}

	/**
	 * @method core.treeModel.operation.InsertOperation#getReversed
	 * @returns {core.treeModel.operation.RemoveOperation}
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
