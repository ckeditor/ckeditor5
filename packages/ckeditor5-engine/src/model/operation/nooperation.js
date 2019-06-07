/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/nooperation
 */

import Operation from './operation';

/**
 * Operation which is doing nothing ("empty operation", "do-nothing operation", "noop"). This is an operation,
 * which when executed does not change the tree model. It still has some parameters defined for transformation purposes.
 *
 * In most cases this operation is a result of transforming operations. When transformation returns
 * {@link module:engine/model/operation/nooperation~NoOperation} it means that changes done by the transformed operation
 * have already been applied.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class NoOperation extends Operation {
	get type() {
		return 'noop';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/nooperation~NoOperation} Clone of this operation.
	 */
	clone() {
		return new NoOperation( this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/nooperation~NoOperation}
	 */
	getReversed() {
		return new NoOperation( this.baseVersion + 1 );
	}

	_execute() {
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'NoOperation';
	}
}
