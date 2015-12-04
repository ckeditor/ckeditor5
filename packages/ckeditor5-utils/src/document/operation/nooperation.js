/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/operation/operation'
], ( Operation ) => {
	/**
	 * Operation which is doing nothing ("empty operation", "do-nothing operation", "noop").
	 * This is an operation, which when executed does not change the tree model.
	 * It still has some parameters defined for transformation purposes.
	 *
	 * In most cases this operation is a result of transforming operations. When transformation returns
	 * {@link document.operation.NoOperation} it means that changes done by the transformed operation
	 * have already been applied.
	 *
	 * @class document.operation.NoOperation
	 */
	class NoOperation extends Operation {
		clone() {
			return new NoOperation( this.baseVersion );
		}

		getReversed() {
			return new NoOperation( this.baseVersion + 1 );
		}

		_execute() {
			// Do nothing.
		}
	}

	return NoOperation;
} );
