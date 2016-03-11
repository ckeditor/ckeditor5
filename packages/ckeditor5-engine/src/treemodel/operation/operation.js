/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import clone from '../../../utils/lib/lodash/clone.js';

/**
 * Abstract base operation class.
 *
 * @abstract
 * @memberOf core.treeModel.operation
 */
export default class Operation {
	/**
	 * Base operation constructor.
	 * @param {Number} baseVersion {@link core.treeModel.Document#version} on which the operation can be applied.
	 */
	constructor( baseVersion ) {
		/**
		 * {@link core.treeModel.Document#version} on which operation can be applied. If you try to
		 * {@link core.treeModel.Document#applyOperation apply} operation with different base version than the
		 * {@link core.treeModel.Document#version document version} the {@link document-applyOperation-wrong-version}
		 * error is thrown.
		 *
		 * @member {Number} core.treeModel.operation.Operation#baseVersion
		 */
		this.baseVersion = baseVersion;

		/**
		 * Operation type.
		 *
		 * @member {String} core.treeModel.operation.Operation#type
		 */

		/**
		 * {@link core.treeModel.Delta Delta} which the operation is a part of. This property is set by the
		 * {@link core.treeModel.Delta delta} when the operations is added to it by the
		 * {@link core.treeModel.Delta#addOperation} method.
		 *
		 * @member {core.treeModel.Delta} core.treeModel.operation.Operation#delta
		 */

		/**
		 * Creates and returns an operation that has the same parameters as this operation.
		 *
		 * @method core.treeModel.operation.Operation#clone
		 * @returns {core.treeModel.operation.Operation} Clone of this operation.
		 */

		/**
		 * Creates and returns a reverse operation. Reverse operation when executed right after
		 * the original operation will bring back tree model state to the point before the original
		 * operation execution. In other words, it reverses changes done by the original operation.
		 *
		 * Keep in mind that tree model state may change since executing the original operation,
		 * so reverse operation will be "outdated". In that case you will need to
		 * {@link core.treeModel.operation.transform} it by all operations that were executed after the original operation.
		 *
		 * @method core.treeModel.operation.Operation#getReversed
		 * @returns {core.treeModel.operation.Operation} Reversed operation.
		 */

		/**
		 * Executes the operation - modifications described by the operation attributes
		 * will be applied to the tree model.
		 *
		 * @protected
		 * @method core.treeModel.operation.Operation#_execute
		 * @returns {Object} Object with additional information about the applied changes. Always has `range`
		 * property containing changed nodes. May have additional properties depending on the operation type.
		 */
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method core.treeModel.operation.Operation#toJSON
	 * @returns {Object} Clone of this object with the delta property replaced with string.
	 */
	toJSON() {
		const json = clone( this );

		// Due to circular references we need to remove parent reference.
		json.delta = this.delta ? '[core.treeModel.Delta]' : null;

		return json;
	}
}
