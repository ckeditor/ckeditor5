/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], function() {
	/**
	 * Abstract base operation class.
	 *
	 * @abstract
	 * @class document.operations.Operation
	 */
	class Operation {
		/**
		 * Base operation constructor.
		 *
		 * @param {Number} baseVersion {@link document.Document#version} on which the operation can be applied.
		 * @constructor
		 */
		constructor( baseVersion ) {
			/**
			 * {@link document.Document#version} on which operation can be applied. If you try to
			 * {@link document.Document#applyOperation apply} operation with different base version than the
			 * {@link document.Document#version document version} the {@link document-applyOperation-wrong-version}
			 * error is thrown.
			 *
			 * @property {Number}
			 */
			this.baseVersion = baseVersion;

			/**
			 * Executes the operation - modifications described by the operation attributes
			 * will be applied to the tree model.
			 *
			 * @method _execute
			 * @protected
			 */

			/**
			 * Creates and returns a reverse operation. Reverse operation when executed right after
			 * the original operation will bring back tree model state to the point before the original
			 * operation execution. In other words, it reverses changes done by the original operation.
			 *
			 * Keep in mind that tree model state may change since executing the original operation,
			 * so reverse operation will be "outdated". In that case you will need to
			 * {@link #getTransformedBy transform} it by all operations that were executed after the original operation.
			 *
			 * @method getReversed
			 * @returns {document.operations.Operation} Reversed operation.
			 */

			/**
			 * Creates and returns a clone of this operation which is transformed by the given operation.
			 * When operation is transformed its parameters may change accordingly to the operation which it is
			 * transformed by. If the given operation applied to the tree model any modifications which are
			 * affecting ranges/positions/nodes connected with this operation, those changes will be reflected
			 * in the parameters of the returned operation.
			 *
			 * Whenever the {@link document.Document document} has different {@link document.Document#baseVersion}
			 * than an operation you want to {@link document.Document#applyOperation apply}, you need to transform
			 * all the operations that were executed on the {@link document.Document document} since it has
			 * {@link document.Document#baseVersion} same as the operation (transform in the same order as those
			 * operations were executed). This way all modifications done to the tree model will be reflected
			 * in the operation parameters and the operation will "work" on "up-to-date" version of the tree model.
			 *
			 * **TODO**: So far we think that transforming one operation by another one may result in more than one
			 * operation. This needs to be clarified in this documentation.
			 *
			 * @method getTransformedBy
			 * @param {document.operations.Operation} operation Operation by which this operation will be transformed.
			 * @returns {document.operations.Operation[]} A result of transformation of this operation by the given operation.
			 */
		}
	}

	return Operation;
} );
