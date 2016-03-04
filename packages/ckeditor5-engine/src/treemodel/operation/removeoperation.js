/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import MoveOperation from './moveoperation.js';
import Position from '../position.js';
import ReinsertOperation from './reinsertoperation.js';

/**
 * Operation to remove a range of nodes.
 *
 * @memberOf core.treeModel.operation
 * @extends core.treeModel.operation.Operation
 */
export default class RemoveOperation extends MoveOperation {
	/**
	 *
	 * Creates a remove operation.
	 *
	 * @param {core.treeModel.Position} position Position before the first node to remove.
	 * @param {Number} howMany How many nodes to remove.
	 * @param {Number} baseVersion {@link core.treeModel.Document#version} on which operation can be applied.
	 */
	constructor( position, howMany, baseVersion ) {
		// Position in a graveyard where nodes were moved.
		const graveyardPosition = Position.createFromParentAndOffset( position.root.document.graveyard, 0 );

		super( position, howMany, graveyardPosition, baseVersion );
	}

	/**
	 * @see core.treeModel.operation.Operation#type
	 */
	get type() {
		return 'remove';
	}

	/**
	 * @see core.treeModel.operation.MoveOperation#isSticky
	 */
	get isSticky() {
		return false;
	}

	/**
	 * @returns {core.treeModel.operation.ReinsertOperation}
	 */
	getReversed() {
		return new ReinsertOperation( this.targetPosition, this.howMany, this.sourcePosition, this.baseVersion + 1 );
	}

	/**
	 * @returns {core.treeModel.operation.RemoveOperation}
	 */
	clone() {
		return new RemoveOperation( this.sourcePosition, this.howMany, this.baseVersion );
	}
}
