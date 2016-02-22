/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Base class for all deltas.
 *
 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
 * rename element. Delta is composed of operations, which are unit changes needed to be done to execute user action.
 *
 * Multiple deltas are grouped into a single {@link core.treeModel.Batch}.
 *
 * @memberOf core.treeModel.delta
 */
export default class Delta {
	/**
	 * Creates a delta instance.
	 */
	constructor() {
		/**
		 * {@link core.treeModel.Batch} which delta is a part of. This property is null by default and set by the
		 * {@link core.treeModel.Batch#addDelta} method.
		 *
		 * @readonly
		 * @member {core.treeModel.Batch} core.treeModel.delta.Delta#batch
		 */
		this.batch = null;

		/**
		 * Array of operations which compose delta.
		 *
		 * @readonly
		 * @member {core.treeModel.operation.Operation[]} core.treeModel.delta.Delta#operations
		 */
		this.operations = [];
	}

	/**
	 * Add operation to the delta.
	 *
	 * @param {core.treeModel.operation.Operation} operation Operation instance.
	 */
	addOperation( operation ) {
		operation.delta = this;
		this.operations.push( operation );

		return operation;
	}
}
