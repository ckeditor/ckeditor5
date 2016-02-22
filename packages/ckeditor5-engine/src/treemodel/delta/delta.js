/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Creates a delta instance.
 *
 * @classdesc
 * Base class for all deltas.
 *
 * Delta is a single, from the user action point of view, change in the editable document, like insert, split or
 * rename element. Delta is composed of operations, which are unit changes needed to be done to execute user action.
 *
 * Multiple deltas are grouped into a single {@link core.treeModel.Batch}.
 *
 * @class core.treeModel.delta.Delta
 */
export default class Delta {
	constructor() {
		/**
		 * {@link core.treeModel.Batch} which delta is a part of. This property is null by default and set by the
		 * {@link core.treeModel.Batch#addDelta} method.
		 *
		 * @readonly
		 * @type {core.treeModel.Batch}
		 */
		this.batch = null;

		/**
		 * Array of operations which compose delta.
		 *
		 * @readonly
		 * @type {core.treeModel.operation.Operation[]}
		 */
		this.operations = [];
	}

	/**
	 * Add operation to the delta.
	 *
	 * @method core.treeModel.delta.Delta#addOperation
	 * @param {core.treeModel.operation.Operation} operation Operation instance.
	 */
	addOperation( operation ) {
		operation.delta = this;
		this.operations.push( operation );

		return operation;
	}
}
