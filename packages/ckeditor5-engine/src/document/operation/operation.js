/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [], () => {
	/**
	 * Abstract base operation class.
	 *
	 * @abstract
	 * @class document.operation.Operation
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
			 * {@link Document.Delta Delta} which the operation is a part of. This property is set by the
			 * {@link Document.Delta delta} when the operations is added to it by the
			 * {@link Document.Delta#addOperation} method.
			 *
			 * @property {Document.Delta} delta
			 */

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
			 * @returns {document.operation.Operation} Reversed operation.
			 */

			/**
			 * Creates and returns an array containing one or more operations, that are the result of
			 * transforming this operation by the given operation. When operation is transformed its parameters
			 * may change accordingly to the operation by which it is transformed. If the given operation
			 * applied any modifications to the tree model that affects ranges/positions/nodes connected with this
			 * operation, those changes will be reflected in the parameters of the returned operation(s).
			 *
			 * In some cases, when given operation apply changes to the same nodes as this operation, there is a need
			 * to create two operations as a result. It would be impossible to create just one operation that handles
			 * modifications needed to be applied to the tree. This is why array is returned instead of single object.
			 * In those cases, returned Array will contain two or more objects. All of those operations has to be
			 * applied or further transformed.
			 *
			 * Whenever the {@link document.Document document} has different {@link document.Document#baseVersion}
			 * than an operation you want to {@link document.Document#applyOperation apply}, you need to transform that
			 * operation by all the operations that were executed on the {@link document.Document document} since it has
			 * {@link document.Document#baseVersion} same as the operation. Transform them in the same order as those
			 * operations were applied. This way all modifications done to the tree model will be reflected
			 * in the operation parameters and the operation will "operate" on "up-to-date" version of the tree model.
			 * This is mostly the case with Operational Transformation but it might be needed in features code.
			 *
			 * @method getTransformedBy
			 * @param {document.operation.Operation} operation Operation by which this operation will be transformed.
			 * @param {Boolean} isStrong Flag indicating whether this operation should be treated as more important
			 * when resolving conflicts.
			 * @returns {Array.<document.operation.Operation>} Result of the transformation.
			 */

			/**
			 * Creates and returns an operation that has the same parameters as this operation.
			 *
			 * @method clone
			 * @param {Number|null} baseVersion New baseVersion for cloned operation. Will copy this operation's
			 * baseVersion if omitted.
			 * @returns {document.operation.Operation} Clone of this operation.
			 */
		}
	}

	return Operation;
} );
