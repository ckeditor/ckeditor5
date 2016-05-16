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
 * @memberOf engine.treeModel.operation
 */
export default class Operation {
	/**
	 * Base operation constructor.
	 * @param {Number} baseVersion {@link engine.treeModel.Document#version} on which the operation can be applied.
	 */
	constructor( baseVersion ) {
		/**
		 * {@link engine.treeModel.Document#version} on which operation can be applied. If you try to
		 * {@link engine.treeModel.Document#applyOperation apply} operation with different base version than the
		 * {@link engine.treeModel.Document#version document version} the {@link document-applyOperation-wrong-version}
		 * error is thrown.
		 *
		 * @member {Number} engine.treeModel.operation.Operation#baseVersion
		 */
		this.baseVersion = baseVersion;

		/**
		 * Operation type.
		 *
		 * @member {String} engine.treeModel.operation.Operation#type
		 */

		/**
		 * {@link engine.treeModel.Delta Delta} which the operation is a part of. This property is set by the
		 * {@link engine.treeModel.Delta delta} when the operations is added to it by the
		 * {@link engine.treeModel.Delta#addOperation} method.
		 *
		 * @member {engine.treeModel.Delta} engine.treeModel.operation.Operation#delta
		 */

		/**
		 * Creates and returns an operation that has the same parameters as this operation.
		 *
		 * @method engine.treeModel.operation.Operation#clone
		 * @returns {engine.treeModel.operation.Operation} Clone of this operation.
		 */

		/**
		 * Creates and returns a reverse operation. Reverse operation when executed right after
		 * the original operation will bring back tree model state to the point before the original
		 * operation execution. In other words, it reverses changes done by the original operation.
		 *
		 * Keep in mind that tree model state may change since executing the original operation,
		 * so reverse operation will be "outdated". In that case you will need to
		 * {@link engine.treeModel.operation.transform} it by all operations that were executed after the original operation.
		 *
		 * @method engine.treeModel.operation.Operation#getReversed
		 * @returns {engine.treeModel.operation.Operation} Reversed operation.
		 */

		/**
		 * Executes the operation - modifications described by the operation attributes
		 * will be applied to the tree model.
		 *
		 * @protected
		 * @method engine.treeModel.operation.Operation#_execute
		 * @returns {Object} Object with additional information about the applied changes. Always has `range`
		 * property containing changed nodes. May have additional properties depending on the operation type.
		 */
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method engine.treeModel.operation.Operation#toJSON
	 * @returns {Object} Clone of this object with the delta property replaced with string.
	 */
	toJSON() {
		const json = clone( this, true );

		json.__class = this.constructor.className;

		// Due to circular references we need to remove parent reference.
		json.delta = this.delta ? `[${this.delta.constructor.className}]` : null;

		return json;
	}

	/**
	 * Name of the operation class used for serialization.
	 *
	 * @type {String}
	 */
	static get className() {
		return 'engine.treeModel.operation.Operation';
	}

	/*jshint unused: true*/
	/**
	 * Creates Element object from deserilized object, ie. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {engine.treeModel.Document} doc Document on which this operation will be applied.
	 * @returns {engine.treeModel.operationOperation}
	 */
	static fromJSON( json, doc ) {
		return new Operation( json.baseVersion );
	}
	/*jshint unused: false*/
}
