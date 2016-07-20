/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Operation from './operation.js';

/**
 * Operation which is doing nothing ("empty operation", "do-nothing operation", "noop"). This is an operation,
 * which when executed does not change the tree model. It still has some parameters defined for transformation purposes.
 *
 * In most cases this operation is a result of transforming operations. When transformation returns
 * {@link engine.model.operation.NoOperation} it means that changes done by the transformed operation
 * have already been applied.
 *
 * @memberOf engine.model.operation
 * @extends engine.model.operation.Operation
 */
export default class NoOperation extends Operation {
	/**
	 * @inheritDoc
	 * @returns {engine.model.operation.NoOperation}
	 */
	clone() {
		return new NoOperation( this.baseVersion );
	}

	/**
	 * @inheritDoc
	 * @returns {engine.model.operation.NoOperation}
	 */
	getReversed() {
		return new NoOperation( this.baseVersion + 1 );
	}

	/**
	 * @inheritDoc
	 */
	_execute() {
		// Do nothing.
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.operation.NoOperation';
	}
}
