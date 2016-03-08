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
	 * A class that will be used when creating reversed delta.
	 *
	 * @private
	 * @type {Object}
	 */
	get _reverseDeltaClass() {
		return Delta;
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

	/**
	 * Creates and returns a delta that has the same parameters as this delta.
	 *
	 * @returns {core.treeModel.delta.Delta} Clone of this delta.
	 */
	clone() {
		let delta = new this.constructor();
		delta.batch = this.batch;

		for ( let op of this.operations ) {
			delta.addOperation( op.clone() );
		}

		return delta;
	}

	/**
	 * Creates and returns a reverse delta. Reverse delta when executed right after the original delta will bring back
	 * tree model state to the point before the original delta execution. In other words, it reverses changes done
	 * by the original delta.
	 *
	 * Keep in mind that tree model state may change since executing the original delta, so reverse delta may be "outdated".
	 * In that case you will need to {@link core.treeModel.delta.transform} it by all deltas that were executed after
	 * the original delta.
	 *
	 * @returns {core.treeModel.delta.Delta} Reversed delta.
	 */
	getReversed() {
		let delta = new this._reverseDeltaClass();

		for ( let op of this.operations ) {
			let reversedOp = op.getReversed();
			reversedOp.baseVersion += this.operations.length - 1;

			delta.addOperation( reversedOp );
		}

		delta.operations.reverse();

		return delta;
	}

	/**
	 * Delta priority. Used in {@link core.treeModel.delta.transform delta transformations}. Delta with the higher
	 * priority will be treated as more important when resolving transformation conflicts. If deltas have same
	 * priority, other factors will be used to determine which delta is more important.
	 *
	 * @private
	 * @type {Number}
	 */
	static get _priority() {
		return 0;
	}
}
