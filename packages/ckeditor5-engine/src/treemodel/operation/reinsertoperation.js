/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import MoveOperation from './moveoperation.js';
import RemoveOperation from './removeoperation.js';

/**
 * Operation to reinsert previously removed nodes back to the non-graveyard root.
 * This is basically {@link core.treeModel.operation.MoveOperation} but it returns
 * {@link core.treeModel.operation.RemoveOperation} when reversed.
 *
 * With this class, we achieve two goals: by having separate classes it's easier to distinguish whether move
 * operation is actually a remove/reinsert operation and fire proper events. Also it
 * will be easier to expand if we need to change operation's behavior if it is remove/reinsert.
 *
 * @memberOf core.treeModel.operation
 * @extends core.treeModel.operation.Operation
 */
export default class ReinsertOperation extends MoveOperation {
	/**
	 * @returns {core.treeModel.operation.RemoveOperation}
	 */
	getReversed() {
		return new RemoveOperation( this.targetPosition, this.howMany, this.baseVersion + 1 );
	}

	/**
	 * @see core.treeModel.operation.Operation#type
	 */
	get type() {
		return 'reinsert';
	}

	/**
	 * @see core.treeModel.operation.MoveOperation#isSticky
	 */
	get isSticky() {
		return false;
	}
}
