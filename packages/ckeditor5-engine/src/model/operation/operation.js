/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/operation/operation
 */

import clone from '@ckeditor/ckeditor5-utils/src/lib/lodash/clone';

/**
 * Abstract base operation class.
 *
 * @abstract
 */
export default class Operation {
	/**
	 * Base operation constructor.
	 *
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( baseVersion ) {
		/**
		 * {@link module:engine/model/document~Document#version} on which operation can be applied. If you try to
		 * {@link module:engine/model/model~Model#applyOperation apply} operation with different base version than the
		 * {@link module:engine/model/document~Document#version document version} the
		 * {@link module:utils/ckeditorerror~CKEditorError model-document-applyOperation-wrong-version} error is thrown.
		 *
		 * @member {Number}
		 */
		this.baseVersion = baseVersion;

		/**
		 * Defines whether operation is executed on attached or detached {@link module:engine/model/item~Item items}.
		 *
		 * @readonly
		 * @member {Boolean} #isDocumentOperation
		 */
		this.isDocumentOperation = this.baseVersion !== null;

		/**
		 * Operation type.
		 *
		 * @readonly
		 * @member {String} #type
		 */

		/**
		 * {@link module:engine/model/delta/delta~Delta Delta} which the operation is a part of. This property is set by the
		 * {@link module:engine/model/delta/delta~Delta delta} when the operations is added to it by the
		 * {@link module:engine/model/delta/delta~Delta#addOperation} method.
		 *
		 * @member {module:engine/model/delta/delta~Delta} #delta
		 */

		/**
		 * Creates and returns an operation that has the same parameters as this operation.
		 *
		 * @method #clone
		 * @returns {module:engine/model/operation/operation~Operation} Clone of this operation.
		 */

		/**
		 * Creates and returns a reverse operation. Reverse operation when executed right after
		 * the original operation will bring back tree model state to the point before the original
		 * operation execution. In other words, it reverses changes done by the original operation.
		 *
		 * Keep in mind that tree model state may change since executing the original operation,
		 * so reverse operation will be "outdated". In that case you will need to
		 * {@link module:engine/model/operation/transform~transform} it by all operations that were executed after the original operation.
		 *
		 * @method #getReversed
		 * @returns {module:engine/model/operation/operation~Operation} Reversed operation.
		 */

		/**
		 * Executes the operation - modifications described by the operation properties will be applied to the model tree.
		 *
		 * @protected
		 * @method #_execute
		 */
	}

	/**
	 * Checks whether the operation's parameters are correct and the operation can be correctly executed. Throws
	 * an error if operation is not valid.
	 *
	 * @protected
	 * @method #_validate
	 */
	_validate() {
	}

	/**
	 * Custom toJSON method to solve child-parent circular dependencies.
	 *
	 * @method #toJSON
	 * @returns {Object} Clone of this object with the delta property replaced with string.
	 */
	toJSON() {
		const json = clone( this, true );

		json.__className = this.constructor.className;

		// Remove parent delta to avoid circular dependencies.
		delete json.delta;

		// Only document operations are shared with other clients so it is not necessary to keep this information.
		delete json.isDocumentOperation;

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
	 * @param {module:engine/model/document~Document} doc Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/operation~Operation}
	 */
	static fromJSON( json ) {
		return new this( json.baseVersion );
	}
}
