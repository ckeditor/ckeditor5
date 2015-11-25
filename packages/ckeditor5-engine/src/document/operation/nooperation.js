/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation'
], ( Operation ) => {
	/**
	 * Operation that is doing nothing ("empty operation", "do-nothing operation", "noop").
	 * This is an operation, which {@link #_execute} method does not change tree model.
	 * It still has defined some parameters for transformations purposes.
	 *
	 * In most cases this operation is a result of transforming operations. When transformation returns
	 * {@link document.operation.NoOperation} it means that changes done by the transformed operation
	 * has already been applied.
	 *
	 * @class document.operation.NoOperation
	 */
	class NoOperation extends Operation {
		_execute() {
			// Do nothing.
		}

		clone() {
			return new NoOperation( this.baseVersion );
		}

		getReversed() {
			return new NoOperation( this.baseVersion + 1 );
		}
	}

	return NoOperation;
} );
