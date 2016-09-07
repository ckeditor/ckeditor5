/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import clone from '../../../utils/lib/lodash/clone.js';

/**
 * Abstract base operation class.
 *
 * @abstract
 * @memberOf engine.model.operation
 */
export default class Operation {
	/**
	 * Base operation constructor.
	 * @param {Number} baseVersion {@link engine.model.Document#version} on which the operation can be applied.
	 */
	constructor( baseVersion ) {
		/**
		 * {@link engine.model.Document#version} on which operation can be applied. If you try to
		 * {@link engine.model.Document#applyOperation apply} operation with different base version than the
		 * {@link engine.model.Document#version document version} the {@link document-applyOperation-wrong-version}
		 * error is thrown.
		 *
		 * @member {Number} engine.model.operation.Operation#baseVersion
		 */
		this.baseVersion = baseVersion;

		/**
		 * Operation type.
		 *
		 * @member {String} engine.model.operation.Operation#type
		 */

		/**
		 * {@link engine.model.Delta Delta} which the operation is a part of. This property is set by the
		 * {@link engine.model.Delta delta} when the operations is added to it by the
		 * {@link engine.model.Delta#addOperation} method.
		 *
		 * @member {engine.model.Delta} engine.model.operation.Operation#delta
		 */

		/**
		 * Creates and returns an operation that has the same parameters as this operation.
		 *
		 * @method engine.model.operation.Operation#clone
		 * @returns {engine.model.operation.Operation} Clone of this operation.
		 */

		/**
		 * Creates and returns a reverse operation. Reverse operation when executed right after
		 * the original operation will bring back tree model state to the point before the original
		 * operation execution. In other words, it reverses changes done by the original operation.
		 *
		 * Keep in mind that tree model state may change since executing the original operation,
		 * so reverse operation will be "outdated". In that case you will need to
		 * {@link engine.model.operation.transform} it by all operations that were executed after the original operation.
		 *
		 * @method engine.model.operation.Operation#getReversed
		 * @returns {engine.model.operation.Operation} Reversed operation.
		 */

		/**
		 * Executes the operation - modifications described by the operation attributes
		 * will be applied to the tree model.
		 *
		 * @protected
		 * @method engine.model.operation.Operation#_execute
		 * @returns {Object} Object with additional information about the applied changes. It properties depends on the
		 * operation type.
		 */
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method engine.model.operation.Operation#toJSON
	 * @returns {Object} Clone of this object with the delta property replaced with string.
	 */
	toJSON() {
		const json = clone( this, true );

		json.__className = this.constructor.className;

		// Remove parent delta to avoid circular dependencies.
		delete json.delta;

		return json;
	}

	/**
	 * Name of the operation class used for serialization.
	 *
	 * @type {String}
	 */
	static get className() {
		return 'engine.model.operation.Operation';
	}

	/**
	 * Creates Operation object from deserilized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {engine.model.Document} doc Document on which this operation will be applied.
	 * @returns {engine.model.operation.Operation}
	 */
	static fromJSON( json ) {
		return new Operation( json.baseVersion );
	}
}
